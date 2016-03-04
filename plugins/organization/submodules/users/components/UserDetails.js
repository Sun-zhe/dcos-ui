import {Form} from 'reactjs-components';
import mixin from 'reactjs-mixin';
/*eslint-disable no-unused-vars*/
import React from 'react';
/*eslint-enable no-unused-vars*/
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ACLUserStore from '../stores/ACLUserStore';

const METHODS_TO_BIND = [
  'handlePasswordSubmit',
  'onUserStoreUpdateError',
  'onUserStoreUpdateSuccess'
];

class UserDetails extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {userStoreError: false};

    this.store_listeners = [
      {
        name: 'user',
        events: ['updateSuccess', 'updateError']
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handlePasswordSubmit(formData) {
    ACLUserStore.updateUser(this.props.userID, {
      password: formData.password
    });
  }

  onUserStoreUpdateError(error) {
    this.setState({
      userStoreError: error
    });
  }

  onUserStoreUpdateSuccess() {
    this.setState({
      userStoreError: false
    });
  }

  render() {
    let userDetails = ACLUserStore.getUser(this.props.userID);
    let passwordDefinition = [
      {
        defaultPasswordValue: '••••••••',
        fieldType: 'password',
        name: 'password',
        placeholder: 'Password',
        required: true,
        sharedClass: 'form-element-inline',
        showError: this.state.userStoreError,
        showLabel: false,
        writeType: 'edit',
        validation: function () { return true; },
        value: ''
      }
    ];

    return (
      <div className="side-panel-content-user-details container container-fluid
        container-pod container-pod-short">
        <div className="flex-container-col">
          <dl className="row flex-box">
            <dt className="column-3 emphasize">
              Username
            </dt>
            <dt className="column-9">
              {userDetails.uid}
            </dt>
          </dl>
          <dl className="row flex-box">
            <dt className="column-3 emphasize">
              Password
            </dt>
            <dt className="column-9">
              <Form definition={passwordDefinition}
                onSubmit={this.handlePasswordSubmit} />
            </dt>
          </dl>
        </div>
      </div>
    );
  }
}
module.exports = UserDetails;