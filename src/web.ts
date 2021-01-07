import { WebPlugin } from '@capacitor/core';
import { GPayNativePlugin } from './definitions';

export class GPayNativeWeb extends WebPlugin implements GPayNativePlugin {
  constructor() {
    super({
      name: 'GPayNative',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}

const GPayNative = new GPayNativeWeb();

export { GPayNative };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(GPayNative);
