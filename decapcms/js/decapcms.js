window.CMS_MANUAL_INIT = true

import { init } from 'decap-cms-app'
import * as params from '@params'

if (params.config === undefined) {
    init()
} else {
    init(params.config)
}
