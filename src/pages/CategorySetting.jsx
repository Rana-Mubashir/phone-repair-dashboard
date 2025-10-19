import React from 'react'
import { Helmet } from 'react-helmet-async';
import View from '../sections/categorySettings/Index'

function CategorySetting() {
    return (
        <div>
            <Helmet>
                <title> Category Setting | Minimal UI </title>
            </Helmet>
            <View />
        </div>
    )
}
export default CategorySetting
