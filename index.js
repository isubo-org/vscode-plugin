const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const { Isubo } = require('./lib/isubo');

const store = {
  isLoading: false,
};

function getIsuboCoreIns(confPath) {
  const isuboCore = new Isubo({
    confPath,
  });
  // isuboCore.updateConf({ push_asset: 'auto' });
  return isuboCore;
}

function registerDeployCmdFactory(context) {
  return (cmd, cb) => {
    const disposable = vscode.commands.registerCommand(`isubo.${cmd}`, async (selectedFile) => {
      const cwd = process.cwd();
      let repoCwd = cwd;
      const postPath = selectedFile.path;

      // filter non-md file
      const confPath = findConfFile(path.parse(postPath).dir);

      if (!confPath) {
        vscode.window.showInformationMessage('Without conf file');
        return;
      }

      repoCwd = path.parse(confPath).dir;
      process.chdir(repoCwd);

      try {
        await cb({ postPath, confPath }); 
      } catch (error) { }
      process.chdir(cwd);
    });
    context.subscriptions.push(disposable);
  };
}

function findConfFile(postdir, cnt = 0) {
  if (cnt >= 4) {
    return '';
  }

  const confpath = path.join(postdir, 'isubo.conf.yml');
  if (fs.existsSync(confpath)) {
    return confpath;
  }
  return findConfFile(path.join(postdir, '../'), cnt + 1);
}

function activate(context) {
  const registerCmdPure = registerDeployCmdFactory(context);
  const registerCmd = (deployType, cb) => registerCmdPure(deployType, async (...argv) => {
    if (store.isLoading) {
      vscode.window.showWarningMessage('There are already posts being pushed');
      return;
    }
    store.isLoading = true;
    try {
      await cb(...argv);
    } catch (error) {}
    store.isLoading = false;
  });

  registerCmd('create', async ({ postPath, confPath }) => {
    const isuboCore = getIsuboCoreIns(confPath);
    await isuboCore.create([postPath]);
  });

  registerCmd('update', async ({ postPath, confPath }) => {
    const isuboCore = getIsuboCoreIns(confPath);
    await isuboCore.update([postPath]);
  });

  registerCmd('publish', async () => {
    const enumOpts = {
      YES: 'yes',
      NO: 'no',
    };
    const options = [enumOpts.YES, enumOpts.NO];
    // const options = ['Option 1', 'Option 2', 'Option 3'];

    const selectedOption = await vscode.window.showQuickPick(options, {
      placeHolder: 'Select an option'
    });

    console.info(selectedOption);
  });
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};
