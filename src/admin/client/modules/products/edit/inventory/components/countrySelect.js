import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import style from './countrySelect.css';
import '../../../../../../../../public/admin-assets/css/react-select.css';


import countries from './countries';

class CountrySelect extends Component {
  render() {
    const { props } = this;
    const { labelText } = props;

    return (
      <div className={style.countryHints}>
        <label>{ labelText }</label>
        <Select options={countries} {...props} {...props.input} multi simpleValue onBlur={() => {}} />
        {
          // Note: here I spread props and props.input as the Field component
          // passes down this input object containing the value, onChange, onBlur, onFocus etc.
          // So spreading the props passes the props to the component, and then spreading props.input
          // passes the onChange, value etc props that Redux Form provides down to the React Select component
          // as it expects them.

          // onBlur is a hack to overwrite the Select component's default behaviour,
          // which by default will clear the values if its not assigned to state.
        }
      </div>
    );
  }
};

export default CountrySelect;
