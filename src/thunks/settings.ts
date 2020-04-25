import { getDerivedDarkMode } from '../selectors/settings';
import { setStyle } from '../style';
import { PLThunkAction, PLThunkDispatch, t } from './types';

export function setDarkMode(value: boolean | undefined): PLThunkAction {
    return t('setDarkMode', { value }, async (dispatch: PLThunkDispatch) => {
        dispatch({
            type: 'settings-set-dark-mode',
            value,
        });
        setStyle(getDerivedDarkMode(value));
    });
}
