window.CMS_MANUAL_INIT = true

import CMS, { init } from 'decap-cms-app'
import * as params from '@params'

// register any additional components
if (window.editorComponents !== undefined) {
    for (const component of window.editorComponents) {
        console.log(`Loading "${component.id}" component into CMS...`)
        CMS.registerEditorComponent(component)
    }
}

// initialise the CMS
init({config: params.config})
