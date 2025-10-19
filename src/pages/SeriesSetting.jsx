import React from 'react'
import { Helmet } from 'react-helmet-async';
import View from '../sections/seriesSettings/Index'

function SeriesSetting() {
    return (
        <div>
            <Helmet>
                <title> Series Setting | Minimal UI </title>
            </Helmet>
            <View />
        </div>
    )
}
export default SeriesSetting
