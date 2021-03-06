import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setUser, toggleFavorite } from '../../actions';
import * as API from '../../utils';
import './LoginForm.css';

export class LoginForm extends Component {
  constructor() {
    super()
    this.state = {
      name: '',
      email: '',
      password: '',
      isSigningUp: false,
      errorMessage: '',
      isDisabled: true
    }
  }

  handleInputChange = async (event) => {
    const { name, value } = event.target;
    await this.setState({[name]: value})
    await this.toggleSubmit();
  }

  toggleSubmit = async () => {
    const { isSigningUp, email, password, name } = this.state
    if ( isSigningUp && name && email && password ) {
      await this.setState({isDisabled: false})
      return true
    } else if (!isSigningUp && email && password) {
      await this.setState({isDisabled: false})
      return true
    } else {
      await this.setState({isDisabled: true})
      return false
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    const { isSigningUp } = this.state;

    if (isSigningUp) {
      const result = await this.createNewUser()

      this.checkForError(isSigningUp, result)
    } else {
      const result = await this.loginUser();
      this.checkForError(isSigningUp, result)

    }
  }

  checkForError = async (isSigningUp, result) => {
    if (isSigningUp && typeof result === 'object') {
      this.props.setUser(result.id)
      this.props.history.push('/')
    } else if (!isSigningUp && typeof result === 'object') {
      this.props.setUser(result.data.id)
      const userFavorites = await API.fetchFavorites(result.data.id)
      this.loadFavorites(userFavorites);
      this.props.history.push('/')
    } else {
      this.setState({
        errorMessage: result
      })
    }
  }

  loadFavorites = (userFavorites) => {
    userFavorites.forEach(userFav => {
      this.props.toggleFavorite(userFav.movie_id)
    })
  }

  createNewUser = async () => {
    const user = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
    }
    return await API.addUser(user);
  }

  loginUser = async () => {
    const user = {
      email: this.state.email,
      password: this.state.password,
    }
    return await API.loginUser(user)
  }

  toggleSigningUp = (event) => {
    event.preventDefault()
    this.setState({isSigningUp: !this.state.isSigningUp})
  }

  render() {
    const { name, isSigningUp, email, password, errorMessage, isDisabled } = this.state

    return(
      <div>
        <div
          className={errorMessage ? 'lf-error-message' : 'hidden'}>
          { errorMessage }
        </div>
        <form
          className='lf-form'
          onSubmit={ this.handleSubmit }>
          <h2
            className='lf-banner-text'>
            { isSigningUp ? 'ENLIST IN TEAM ZISSOU' : 'HAVE AN ACCOUNT?' }
          </h2>
          <div className="lf-input-container">
            <input
              className={ isSigningUp ? "name-login" : "hidden" }
              name="name"
              value={name}
              onChange={ this.handleInputChange }
              placeholder='Klaus'
            />
            <input
              className="email-login"
              type="email"
              name="email"
              value={email}
              onChange={this.handleInputChange}
              placeholder= {
                isSigningUp ? 'klaus@daimler.net' : "wes@anderson.com"
              }
            />
            <input
              className="password-login"
              type="password"
              name="password"
              value={password}
              onChange={this.handleInputChange}
              placeholder="Type password here"
            />
          </div>
          <button
            className="lf-submit-login"
            disabled={isDisabled}
            onClick={this.handleSubmit}>
            { isSigningUp ? 'CREATE ACCOUNT' : 'LOGIN' }
          </button>
          <div className="lf-sign-up-container">
            <h3 className='lf-lower-banner-text'>
              { isSigningUp ? 'ERM, NVM...' : 'NEED AN ACCOUNT?' }
            </h3>
            <button
              className="lf-sign-up-btn"
              onClick={this.toggleSigningUp}
            >
              { isSigningUp ? 'CANCEL SIGN UP' : 'SIGN UP' }
            </button>
          </div>
        </form>
      </div>
    )
  }
}

export const mapDispatchToProps = (dispatch) => ({
  setUser: (id) => dispatch(setUser(id)),
  toggleFavorite: (movieId) => dispatch(toggleFavorite(movieId))
})

LoginForm.propTypes = {
  setUser: PropTypes.func.isRequired,
}

export default connect(null, mapDispatchToProps)(LoginForm);