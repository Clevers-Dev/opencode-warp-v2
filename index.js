import fs from 'node:fs';
import path from 'node:path';

// Helper para emitir secuencias ANSI/OSC directamente al dispositivo de consola
// En Windows, escribir a //./CONOUT$ llega directo al emulador de Warp evitando el buffer del TUI
// En Unix/macOS, escribir a /dev/tty cumple la misma funcion
function emitToTerminal(seq) {
  const devices = ['//./CONOUT$', '/dev/tty'];
  for (const dev of devices) {
    try {
      const fd = fs.openSync(dev, 'w');
      fs.writeSync(fd, seq);
      fs.closeSync(fd);
      return;
    } catch {
      // Continuar al siguiente dispositivo
    }
  }
}

function sendWarpEvent(agentEvent, sessionID, extra = {}) {
  const cwd = process.cwd();
  const project = path.basename(cwd);
  const payload = {
    v: 1,
    agent: 'opencode',
    event: agentEvent,
    session_id: sessionID || 'default',
    cwd,
    project,
    ...extra
  };
  emitToTerminal(`\x1b]777;notify;warp://cli-agent;${JSON.stringify(payload)}\x07`);
}

const plugin = {
  id: 'opencode-warp-v2',
  async setup(ctx) {
    const controller = new AbortController();
    const currentDir = ctx.location?.directory || process.cwd();

    // Iniciar loop de eventos nativos del servidor OpenCode 2.0+
    (async () => {
      try {
        if (!ctx.event || typeof ctx.event.subscribe !== 'function') return;

        for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
          if (!event || !event.type) continue;

          // Filtrar si el evento pertenece a otro directorio/proyecto
          if (event.location && event.location.directory && event.location.directory !== currentDir) {
            continue;
          }

          const sessionID = event.data?.sessionID || event.data?.form?.sessionID || 'default';

          switch (event.type) {
            case 'session.execution.started':
            case 'session.busy': {
              // Tab title en Warp: Pensando / Trabajando
              emitToTerminal('\x1b]0;⏳ [OpenCode] Pensando...\x07');
              sendWarpEvent('prompt_submit', sessionID, {
                query: 'Trabajando...'
              });
              break;
            }

            case 'session.execution.succeeded':
            case 'session.idle': {
              // Tab title en Warp: Listo
              emitToTerminal('\x1b]0;✅ [OpenCode] Listo\x07');
              sendWarpEvent('stop', sessionID, {
                response: 'Listo'
              });
              // Notificaciones de escritorio nativas en Warp
              emitToTerminal('\x1b]777;notify;OpenCode;¡Tarea completada! Listo para continuar.\x07');
              emitToTerminal('\x1b]9;OpenCode: Tarea completada\x07');
              break;
            }

            case 'session.execution.failed': {
              emitToTerminal('\x1b]0;❌ [OpenCode] Error\x07');
              sendWarpEvent('stop', sessionID, {
                response: 'Error en la tarea'
              });
              emitToTerminal('\x1b]777;notify;OpenCode;Error en la ejecucion\x07');
              break;
            }

            case 'session.execution.interrupted': {
              emitToTerminal('\x1b]0;⏹️ [OpenCode] Detenido\x07');
              sendWarpEvent('stop', sessionID, {
                response: 'Detenido'
              });
              break;
            }

            case 'permission.asked': {
              emitToTerminal('\x1b]0;⚠️ [OpenCode] Esperando permiso...\x07');
              sendWarpEvent('permission_request', sessionID, {
                summary: 'Requiere confirmacion de usuario'
              });
              emitToTerminal('\x1b]777;notify;OpenCode;Esperando confirmacion de permisos...\x07');
              break;
            }

            case 'session.tool.input.started': {
              const toolName = event.data?.name || 'herramienta';
              emitToTerminal(`\x1b]0;⚡ [OpenCode] ${toolName}...\x07`);
              sendWarpEvent('tool_complete', sessionID, {
                tool_name: toolName
              });
              break;
            }
          }
        }
      } catch {
        // Ignorar cancelaciones de stream o interrupciones esperadas
      }
    })();

    return async () => {
      controller.abort();
    };
  }
};

export default plugin;
