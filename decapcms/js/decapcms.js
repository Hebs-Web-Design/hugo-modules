window.CMS_MANUAL_INIT = true

import CMS, { init } from 'decap-cms-app'
import * as params from '@params'

// register any additional components
if (params.components !== undefined) {
    for (const component of params.components) {
        CMS.registerEditorComponent(component)
    }
}

// initialise the CMS
init({config: params.config})
