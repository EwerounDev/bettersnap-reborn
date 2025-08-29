import settings from '../../lib/settings';
import Module from '../../lib/module';
import { getCofStore } from '../../utils/snapchat';

enum CofKeys {
  DWEB_SNAP_SENDING_CONTEXT = 'DWEB_SNAP_SENDING_CONTEXT',
  DWEB_PRIVATE_STORIES_VIEWING = 'DWEB_PRIVATE_STORIES_VIEWING',
  DWEB_SNAP_VIEWING = 'DWEB_SNAP_VIEWING',
}

const store = getCofStore();

let oldGetClientCofValue: any = null;
let newGetClientCofValue: any = null;

class ConditionOnsetFlags extends Module {
  constructor() {
    super('Condition Onset Flags');
    store.subscribe(({ getClientCofValue }: any) => getClientCofValue, this.load.bind(this));
    settings.on('SNAP_AS_MOBILE.setting:update', this.load.bind(this));
    settings.on('PRIVATE_STORIES.setting:update', this.load.bind(this));
  }

  load() {
    const storeState = store.getState();
    if (storeState?.getClientCofValue == null) {
      return;
    }

    const snapAsMobileEnabled = settings.getSetting('SNAP_AS_MOBILE');
    const privStoriesEnabled = settings.getSetting('PRIVATE_STORIES');
    const enabled = snapAsMobileEnabled || privStoriesEnabled;
    const changedValues: any = {};

    if (enabled && storeState.getClientCofValue !== newGetClientCofValue) {
      oldGetClientCofValue = storeState.getClientCofValue;

      newGetClientCofValue = new Proxy(oldGetClientCofValue, {
        apply(target: any, thisArg: any, args: any[]) {
          const originalValue = Reflect.apply(target, thisArg, args);
          if (args.length === 0 || args[0] == null) {
            return originalValue;
          }

          const [cofKey] = args;
          const mobileEnabled = settings.getSetting('SNAP_AS_MOBILE');
          if (mobileEnabled && cofKey === CofKeys.DWEB_SNAP_SENDING_CONTEXT) {
            return true;
          }

          const privStoryEnabled = settings.getSetting('PRIVATE_STORIES');
          if (privStoryEnabled && cofKey === CofKeys.DWEB_PRIVATE_STORIES_VIEWING) {
            return { value: 'enabled' };
          }

          return originalValue;
        },
      });

      changedValues.getClientCofValue = newGetClientCofValue;
    }

    if (!enabled && oldGetClientCofValue != null) {
      changedValues.getClientCofValue = oldGetClientCofValue;
      oldGetClientCofValue = null;
      newGetClientCofValue = null;
    }

    if (Object.keys(changedValues).length === 0) {
      return;
    }

    store.setState(changedValues);
  }
}

export default new ConditionOnsetFlags();
