import React from 'react'
import { Helmet } from 'react-helmet-async';
import View from '../sections/repairOptions/Index'

function RepairOptions() {
    return (
        <>
            <Helmet>
                <title> Device Setting | Minimal UI </title>
            </Helmet>
            <View />
        </>
    )
}

export default RepairOptions

