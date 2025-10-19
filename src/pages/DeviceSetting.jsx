import React from 'react'
import { Helmet } from 'react-helmet-async';
import View from '../sections/deviceSettings/Index'

function DeviceSetting() {
    return (
        <div>
            <Helmet>
                <title> Device Setting | Minimal UI </title>
            </Helmet>
            <View />
        </div>
    )
}
export default DeviceSetting
