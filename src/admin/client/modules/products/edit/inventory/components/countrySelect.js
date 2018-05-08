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
      </div>
    );
  }
};

export default CountrySelect;
