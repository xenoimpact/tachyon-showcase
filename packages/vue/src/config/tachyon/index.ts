// @ts-nocheck
import install, * as tachyon from 'tachyon.vue';
import DefaultStyle from './themes/default';
import * as themes from './themes';

import {numToStr, dateToStr} from '@tachyon-showcase/shared';

import ExportXlsx from './addons/xlsx/export';
import ImportXlsx from './addons/xlsx/import';
import CollectionManager from './addons/collection/CollectionManager';

if (import.meta.env.DEV) {
    import('./license-local.ts').then((module) => {});
} else {
    import('./license-local.ts');
}

tachyon.config(DefaultStyle);

tachyon.theme.add('dark', themes.dark);

//타키온 포멧터 지정 - 숫자
tachyon.formatter.add('number', {
    format: function (value: any) {
        if (value == null || value === '') {
            return null;
        }
        value = +value;
        const {scale = 1, pattern, rounding} = this.options;
        return numToStr(value / scale, pattern, rounding);
    }
});

//타키온 포멧터 지정 - 날짜
tachyon.formatter.add('date', {
    toDate(value: any): Date {
        if (value instanceof Date) {
            return value;
        }
        return new Date(value);
    },
    format: function (value: any) {
        if (value == null || value === '') {
            return null;
        }
        const date = this.toDate(value);
        if (!date || isNaN(date.getTime())) {
            console.warn('invalid date', value);
            return value;
        }
        return dateToStr(date, this.options.pattern);
    }
});

//엑셀 내보내기
tachyon.addon.add('export', ExportXlsx);
tachyon.addon.add('import', ImportXlsx);
tachyon.addon.add('collection', CollectionManager);

export default install;
