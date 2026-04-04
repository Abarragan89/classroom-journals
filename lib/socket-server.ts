import { Server as SocketIOServer, Socket } from 'socket.io';

interface SessionState {
  teacherSocketId: string | null;
  studentSocketIds: Set<string>;
  currentSlideIndex: number;
  currentFragmentIndex: number;
}

// In-memory session state — fine for single-instance deploys
const sessions = new Map<string, SessionState>();

export function registerSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    // ── Teacher ────────────────────────────────────────────────────────────
    socket.on(
      'lesson:teacher-join',
      ({ sessionId }: { sessionId: string }) => {
        socket.join(`session:${sessionId}`);

        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, {
            teacherSocketId: socket.id,
            studentSocketIds: new Set(),
            currentSlideIndex: 0,
            currentFragmentIndex: -1,
          });
        } else {
          sessions.get(sessionId)!.teacherSocketId = socket.id;
        }

        const state = sessions.get(sessionId)!;
        socket.emit('session:state', {
          currentSlideIndex: state.currentSlideIndex,
          currentFragmentIndex: state.currentFragmentIndex,
          studentCount: state.studentSocketIds.size,
        });
      },
    );

    socket.on(
      'lesson:navigate',
      ({
        sessionId,
        slideIndex,
        fragmentIndex,
      }: {
        sessionId: string;
        slideIndex: number;
        fragmentIndex: number;
      }) => {
        const state = sessions.get(sessionId);
        if (!state || state.teacherSocketId !== socket.id) return;

        state.currentSlideIndex = slideIndex;
        state.currentFragmentIndex = fragmentIndex;

        socket
          .to(`session:${sessionId}`)
          .emit('slide:update', { slideIndex, fragmentIndex });
      },
    );

    socket.on('lesson:end', ({ sessionId }: { sessionId: string }) => {
      const state = sessions.get(sessionId);
      if (!state || state.teacherSocketId !== socket.id) return;

      io.to(`session:${sessionId}`).emit('session:ended');
      sessions.delete(sessionId);
    });

    // ── Student ────────────────────────────────────────────────────────────
    socket.on(
      'lesson:student-join',
      ({
        sessionId,
        studentId,
        name,
      }: {
        sessionId: string;
        studentId: string;
        name: string;
      }) => {
        socket.join(`session:${sessionId}`);

        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, {
            teacherSocketId: null,
            studentSocketIds: new Set(),
            currentSlideIndex: 0,
            currentFragmentIndex: -1,
          });
        }

        const state = sessions.get(sessionId)!;
        state.studentSocketIds.add(socket.id);

        // Send current slide position to the joining student
        socket.emit('slide:sync', {
          currentSlideIndex: state.currentSlideIndex,
          currentFragmentIndex: state.currentFragmentIndex,
        });

        // Notify teacher
        socket.to(`session:${sessionId}`).emit('student:joined', {
          studentId,
          name,
          studentCount: state.studentSocketIds.size,
        });
      },
    );

    socket.on(
      'checkpoint:submit',
      ({
        sessionId,
        checkpointId,
        studentId,
      }: {
        sessionId: string;
        checkpointId: string;
        studentId: string;
        answer: string;
      }) => {
        const state = sessions.get(sessionId);
        if (!state) return;

        socket
          .to(`session:${sessionId}`)
          .emit('checkpoint:new-response', { checkpointId, studentId });
      },
    );

    // ── Cleanup ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      sessions.forEach((state) => {
        if (state.teacherSocketId === socket.id) {
          state.teacherSocketId = null;
        }
        state.studentSocketIds.delete(socket.id);
      });
    });
  });
}
