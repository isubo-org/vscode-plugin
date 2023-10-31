const vscode = require('vscode');

function progressFactory () {
  const ret = {
    init: () => {},
    resolve: () => {},
    reject: () => {},
    updateMsg: () => {},
  };
  ret.init = ({ title }) => {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      title,
      cancellable: false,
    }, (progress) => {
      ret.updateMsg = (message) => progress.report({ message });
      return new Promise((resolveFn, rejectFn) => {
        let cnt = 0;
        ret.resolve = () => {
          progress.report({ increment: 100 - cnt });
          resolveFn();
        };
        ret.reject = () => {
          progress.report({ increment: 100 - cnt });
          rejectFn();
        };
        const timer = setInterval(() => {
          cnt += 10;
          // 可选
          progress.report({ increment: 10 });
    
          if (cnt >= 90) {
            clearInterval(timer);
            // resolve();
          }
        }, 2000);
      });
    });
  };

  return ret;
}

module.exports = {
  progressFactory,
};
