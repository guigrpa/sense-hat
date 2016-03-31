// @flow

import { mainStory } from 'storyboard-core';
import leds from './leds';

mainStory.debug('sense-hat', 'Initialising...');
// leds.init();

export { setPixel, clearPixels } from './leds';
