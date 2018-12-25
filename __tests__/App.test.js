import React from 'react';
import App from '../App';
import renderer from 'react-test-renderer';

it('matches the snapshot', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
});
