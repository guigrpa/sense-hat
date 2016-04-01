// @flow

import { mainStory } from 'storyboard-core';
import * as leds from './leds';

mainStory.debug('sense-hat', 'Initialising...');
leds.init();

export { leds };
