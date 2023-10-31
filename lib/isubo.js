const vscode = require('vscode');
const { IsuboCore, enumPushAssetType } = require('isubo-core/index.cjs');
const { progressFactory } = require('./utils');

class Isubo extends IsuboCore {
  constructor(props) {
    super(props);
  }

  async update(postPathArr) {
    const progressRef = progressFactory();
    const ret = await super.update({
      filepathArr: postPathArr,
      hint: {
        start() {
          progressRef.init({ title: 'test' });
          progressRef.updateMsg('success111')
        },
        succ() {
          console.info(12123)
          progressRef.updateMsg('success')
        },
        fail() {
          console.info(2222)
          progressRef.reject();
        }
      }
    });

    progressRef.resolve();

    return ret;
  }

  async publishAssets() {
    const { push_asset } = super.conf;
    const promptHandler = async () => {
      const enumOpts = {
        YES: 'yes',
        NO: 'no',
      };
      const options = [enumOpts.YES, enumOpts.NO];

      const selectedOption = await vscode.window.showQuickPick(options, {
        placeHolder: 'Whether to push post assets',
      });

      if (selectedOption === enumOpts.YES) {
        await super.publishAssets();
        return;
      }
    };

    switch (push_asset) {
      case enumPushAssetType.DISABLE:
        break;
      case enumPushAssetType.IDLE:
      case enumPushAssetType.PROMPT:
        await promptHandler();
        break;
      case enumPushAssetType.AUTO:
      default:
        super.publishAssets();
    }
  }
}

module.exports = {
  Isubo,
};
