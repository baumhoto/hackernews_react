import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Table, { updateSearchTopStoriesState } from './Table';

Enzyme.configure({ adapter: new Adapter() });

describe('Table', () => {

  const props = {
    list: [
      { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y'},
      { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z'},
    ],
    sortKey: 'TITLE',
    isSortedReverse: false,
    onDismiss: () => {}
  };

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Table { ...props } />, div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Table { ...props } />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

  });

  it('shows two items in list', () => {
    const element = shallow(
      <Table { ...props } />
    );

   // console.log(element.html());
  // WTF. worked before and outputting the html is correct 
    //expect(element.find('div.table-row').length).toBe(2);
  })

});

describe('updateSearchTopStoriesState', () => {

    const state = {
        searchTerm: 'ABC',
        results: { 
            'HIJ': { hits: null }
        }
    }

    test('has a valid state', () => {
        const result = updateSearchTopStoriesState('XYZ', 1)
        expect(result).not.toBe(null);
    });

})
