import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Enzyme, { shallow } from 'enzyme';
import sinon from 'sinon';
import Adapter from 'enzyme-adapter-react-16';
import Button from './Button';

Enzyme.configure({ adapter: new Adapter() });
describe('Button', () => {
  it('renders without crashing', () => {
    const dummy = () =>  {};
    const div = document.createElement('div');
    ReactDOM.render(<Button onClick={dummy}>Give me More</Button>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const dummy = () => {};
    const component = renderer.create(
      <Button onClick={dummy}>Give me More</Button>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('onClick is called', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(<Button onClick={onButtonClick}>Test</Button>);
    wrapper.find('button').simulate('click');
    expect(onButtonClick.callCount).toBe(1);
  });
});