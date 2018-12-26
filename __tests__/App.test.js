import React from 'react';
import App from '../App';
import { shallow } from 'enzyme';

it('matches the snapshot after font loaded', async () => {
    const wrapper = await shallow(<App/>);
    await wrapper.instance().componentDidMount();
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.state('fontLoaded')).toEqual(true);
});
