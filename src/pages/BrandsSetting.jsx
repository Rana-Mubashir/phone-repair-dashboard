import React from 'react'
import { Helmet } from 'react-helmet-async';
import View from '../sections/brandsSettings/Index'

function BrandsSetting() {
    return (
        <div>
            <Helmet>
                <title> Brands Setting | Minimal UI </title>
            </Helmet>
            <View />
        </div>
    )
}

export default BrandsSetting
