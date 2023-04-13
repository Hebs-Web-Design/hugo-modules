window.CMS_MANUAL_INIT = true;

import CMS, { init } from 'netlify-cms';
import * as params from '@params';

init(params.config);
