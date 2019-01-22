import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const largeColumn = {
  width: '40%',
};

const midColumn = {
  width: '30%',
}

const smallColumn = {
  width: '10%',
}

const Loading = () =>
  <div>Loading ...</div>

const withLoading = (Component) => ({ isLoading, ...rest }) =>
  isLoading
    ? <Loading />
    : <Component { ...rest } />

const withError = (Component) => ({ error, ...props }) =>
  error
    ? <div className="interactions"><p>Something went wrong. Please call 911.</p></div>
    : <Component { ...props } />
  
const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.needToSearchTopStories = this.needToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;

    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  needToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }));
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;
    
    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];
    
    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({ 
      results: { 
        ...results,
        [searchKey]: { hits: updatedHits, page } 
      },
      isLoading: false,
    });
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if(this.needToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }

    event.preventDefault();
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({ 
      results: { 
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render() {
    const { 
      searchTerm, 
      results,
      searchKey,
      error,
      isLoading,
      sortKey,
      isSortReverse,
    } = this.state;

    const page = (
      results && 
      results[searchKey] &&
      results[searchKey].page
    ) || 0;

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search 
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <TableWithConditionalRendering
            isLoading={isLoading}
            error={error}
            list={list}
            sortKey={sortKey}
            isSortReverse={isSortReverse}
            onSort={this.onSort}
            onDismiss={this.onDismiss}
        />
        <div className="interactions">
          <ButtonWithError
            error={error}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
          >
            More  
          </ButtonWithError>
        </div>
      </div>
    );
  }
}

class Search extends Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    const { 
      value, 
      onChange, 
      onSubmit, 
      children 
    } = this.props;

  // do something
  return (
    <form onSubmit={onSubmit}>
      {children} <input
        type="text"
        value={value}
        onChange={onChange}
        ref={el => this.input = el}
      />
      <button type="submit">
        {children}
      </button>
    </form>
    );
  }
}

Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  children: PropTypes.node.isRequired,
}

const Button = ({ 
  onClick, 
  className, 
  children 
}) => {

  Button.defaultProps = {
    className: '',
  }

  return (
    <button 
      onClick={onClick}
      className={className}
      type="button"
    >
      {children}
    </button>
  )

}

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const ButtonWithError = withError(Button);

const Sort = ({ 
  sortKey, 
  activeSortKey,
  onSort, 
  children
}) => {
  const sortClass = classNames(
    'button-inline',
    {'button-active': sortKey === activeSortKey }
  );

  return (
    <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}
    >
      {children}
    </Button>
  );
}
  

const Table = ({ 
  list, 
  sortKey, 
  isSortReverse, 
  onSort, 
  onDismiss 
}) => {
  const sortedList = SORTS[sortKey](list);
  const reverseSortedList = isSortReverse
    ? sortedList.reverse()
    : sortedList;

    return (
      <div className="table">
      <div className="table-header"> 
        <span style={{ width: '40%' }}> 
          <Sort 
            sortKey={'TITLE'} 
            onSort={onSort} 
            activeSortKey={sortKey}
          > 
            Title 
          </Sort> 
        </span> 
        <span style={{ width: '30%' }}> 
          <Sort 
            sortKey={'AUTHOR'} 
            onSort={onSort} 
            activeSortKey={sortKey}
            > 
              Author
          </Sort> 
        </span> 
        <span style={{ width: '10%' }}> 
          <Sort 
            sortKey={'COMMENTS'} 
            onSort={onSort} 
            activeSortKey={sortKey}
          > 
            Comments 
          </Sort> 
        </span> 
        <span style={{ width: '10%' }}> 
          <Sort 
            sortKey={'POINTS'} 
            onSort={onSort} 
            activeSortKey={sortKey}
          > 
            Points 
          </Sort> 
        </span> 
        <span style={{ width: '10%' }}> 
          Archive 
        </span> 
      </div>
      {reverseSortedList.map(item =>
        <div key={item.objectID} className="table-row">
          <span style={ largeColumn }>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={ midColumn }>
            {item.author}
          </span>
          <span style={ smallColumn }>
            {item.num_comments}
          </span>
          <span style={ smallColumn }>
            {item.points}
          </span>
          <span style={ smallColumn }>
            <Button 
              onClick={() => onDismiss(item.objectID)}
              className="button-inline"
            >
              Dismiss 
            </Button>
          </span>
        </div>
      )}
      </div>
    )
}

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

const TableWithConditionalRendering = withError(withLoading(Table))


export default App;

export {
  Button,
  Search,
  Table,
}