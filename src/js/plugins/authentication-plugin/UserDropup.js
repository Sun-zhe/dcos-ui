import {Dropdown, Modal} from "reactjs-components";
import React from "react";

import ACLAuthStore from "../../stores/ACLAuthStore";

const METHODS_TO_BIND = [
  "handleDropdownClose",
  "handleDropdownClick",
  "handleSignOut"
];

const MENU_ITEMS = {
  "button-docs": "Documentation",
  "button-intercom": "Talk with us",
  "button-tour": "Walkthrough",
  "button-sign-out": "Sign Out"
};

export default class UserDropup extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      open: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleDropdownClose() {
    this.setState({open: false});
  }

  handleDropdownClick() {
    this.setState({open: !this.state.open});
  }

  handleSignOut() {
    ACLAuthStore.logout();
  }

  handleMenuItemClick(onClick, e) {
    this.handleDropdownClose();
    if (onClick) {
      // Wait until dropdown transition is done before starting the next
      setTimeout(function () {
        onClick(e);
      }, 250);
    }
  }

  getDropdownMenu(menuItems) {
    let defaultItem = [
      {
        className: "hidden",
        html: "",
        id: "default-item",
        selectedHtml: this.getUserButton(null, function () {})
      }
    ];

    return defaultItem.concat(menuItems.map(function (item, index) {
      return {
        className: "clickable",
        html: item,
        selectedHtml: item,
        id: index
      };
    }));
  }

  getModalMenu(menuItems) {
    return menuItems.map((item, index) => {
      return (
        <li className="clickable" key={index}>
          {item}
        </li>
      );
    });
  }

  getUserButton(user, clickHandler) {
    let description;

    if (user) {
      description = (
        <span className="user-description">
          {user.description}
        </span>
      );
    }

    return (
      <div className="icon-buttons">
        <a
          className="user-dropdown button dropdown-toggle"
          onClick={clickHandler}>
          <span className="icon icon-medium icon-image-container
            icon-user-container">
            <img
              className="clickable"
              src="./img/layout/icon-user-default-64x64@2x.png" />
          </span>
          {description}
        </a>
      </div>
    );
  }

  getUserMenuItems() {
    let items = this.props.items.concat([
      <a onClick={this.handleSignOut} key="button-sign-out" />
    ]);

    return items.map((item) => {
      // Override classes and tooltip, and monkeypatch the onClick to close
      // the dropdown
      let props = {
        className: "",
        "data-behavior": "",
        "data-tip-content": "",
        "data-tip-place": "",
        onClick: this.handleMenuItemClick.bind(this, item.props.onClick)
      };

      return React.cloneElement(item, props, MENU_ITEMS[item.key]);
    });
  }

  render() {
    let user = ACLAuthStore.getUser();
    if (!user) {
      return null;
    }

    let modalClasses = {
      bodyClass: "",
      containerClass: "user-dropdown-menu dropdown",
      innerBodyClass: "",
      modalClass: "dropdown-menu"
    };

    let userButton = this.getUserButton(user, this.handleDropdownClick);
    let userMenuItems = this.getUserMenuItems();

    return (
      <div>
        <Dropdown buttonClassName="sidebar-footer-user-dropdown-button"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          items={this.getDropdownMenu(userMenuItems)}
          initialID="default-item"
          transition={true}
          wrapperClassName="sidebar-footer-user-dropdown dropdown" />
        <div className="open">
          {userButton}
        </div>
        <Modal
          onClose={this.handleDropdownClose}
          open={this.state.open}
          showCloseButton={false}
          showHeader={false}
          showFooter={false}
          transitionNameModal="user-dropdown-menu"
          {...modalClasses}>
          {userButton}
          <ul className="dropdown-menu-list">
            {this.getModalMenu(userMenuItems)}
          </ul>
        </Modal>
      </div>
    );
  }
}

UserDropup.defaultProps = {
  items: []
};

UserDropup.propTypes = {
  items: React.PropTypes.arrayOf(React.PropTypes.node)
};