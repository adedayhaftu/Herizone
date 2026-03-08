import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import app from './app';
import { prisma } from './lib/prisma';

const PORT = parseInt(process.env.PORT || '4000', 10);
const server = http.createServer(app);

type ClientMeta = {
  roomId: string;
  name?: string;
};

const clientMeta = new WeakMap<WebSocket, ClientMeta>();
const rooms = new Map<string, Set<WebSocket>>();

function addToRoom(roomId: string, ws: WebSocket) {
  // Remove from previous room
  const prevMeta = clientMeta.get(ws);
  if (prevMeta && rooms.has(prevMeta.roomId)) {
    rooms.get(prevMeta.roomId)!.delete(ws);
  }

  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId)!.add(ws);
  clientMeta.set(ws, { ...prevMeta, roomId });
}

function broadcast(roomId: string, payload: unknown, exclude?: WebSocket) {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(payload);
  for (const client of room) {
    if (client === exclude || client.readyState !== WebSocket.OPEN) continue;
    client.send(data);
  }
}

// ─── WebSocket Chat Gateway (minimal) ─────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws/chat' });

wss.on('connection', (ws) => {
  addToRoom('lobby', ws);
  ws.send(JSON.stringify({ type: 'system', text: 'Connected to chat', at: Date.now() }));

  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);

  ws.on('message', (raw) => {
    let payload: any = raw.toString();
    try {
      payload = JSON.parse(raw.toString());
    } catch {
      // plain text fallback
      payload = { type: 'message', text: raw.toString() };
    }

    const meta = clientMeta.get(ws) ?? { roomId: 'lobby' };

    if (payload.type === 'join') {
      const roomId = payload.expertId || 'lobby';
      addToRoom(roomId, ws);
      ws.send(JSON.stringify({ type: 'system', text: `Joined room ${roomId}`, at: Date.now() }));
      return;
    }

    if (payload.type === 'message') {
      const roomId = meta.roomId || 'lobby';
      const message = {
        type: 'message',
        text: payload.text ?? '',
        image: payload.image ?? null,
        from: payload.from ?? 'peer',
        at: Date.now(),
      };
      broadcast(roomId, message, ws);
      return;
    }
  });

  ws.on('close', () => {
    const meta = clientMeta.get(ws);
    if (meta && rooms.has(meta.roomId)) {
      rooms.get(meta.roomId)!.delete(ws);
    }
    clearInterval(heartbeat);
  });

  ws.on('error', () => {
    ws.close();
  });
});

async function bootstrap() {
  // Verify database connection before accepting traffic
  try {
    await prisma.$connect();
    const dbUrl = process.env.DATABASE_URL ?? '';
    // Extract the host portion for display (hide credentials)
    const dbHost = dbUrl.replace(/\/\/[^@]+@/, '//***@').split('?')[0];
    console.log(`🗄  Database connected → ${dbHost}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log(`🚀 Herizone API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('🔌 WebSocket chat gateway ready at /ws/chat');
  });
}

bootstrap();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n🛑 Server stopped, database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
