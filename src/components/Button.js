import React from 'react';
import PropTypes from 'prop-types';
import '../App.css';

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

const withError = (Component) => ({ error, ...props }) =>
  error
    ? <div className="interactions"><p>Something went wrong. Please call 911.</p></div>
    : <Component { ...props } />

const ButtonWithError = withError(Button);

export default Button;

export {
    ButtonWithError
}