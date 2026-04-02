
    const app = new Promise((resolve, reject) => {
      setTimeout(() => {
        const port = process.env.PORT;
        const socket = 'express.sock';
        process.env.PORT = socket;

        import(`./dist/meeting-agenda-generator/server/server.mjs`).then(({ default: defHandler, reqHandler, app }) => {
          const handler = app?.() ?? reqHandler ?? defHandler;
          if (!handler) {
            reject(`The file at "./dist/meeting-agenda-generator/server/server.mjs" did not export a valid request handler. Expected exports: 'app', 'default', or 'reqHandler'.`);
          } else {
            process.env.PORT = port;
            resolve(handler);
          }
        });
      }, 0);
    });
exports.handle = (req,res) => app.then(it => it(req,res));
