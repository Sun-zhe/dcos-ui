import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosMessages from '../../constants/CosmosMessages';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import FilterInputText from '../../components/FilterInputText';
import InstallPackageModal from '../../components/modals/InstallPackageModal';
import DisplayPackagesTable from '../../components/DisplayPackagesTable';
import Panel from '../../components/Panel';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import StringUtil from '../../utils/StringUtil';

const METHODS_TO_BIND = [
  'handleInstallModalClose',
  'handleSearchStringChange'
];

class PackagesTab extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      errorMessage: false,
      installModalPackage: null,
      isLoading: true
    };

    this.store_listeners = [
      {name: 'cosmosPackages', events: ['availableError', 'availableSuccess']}
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    CosmosPackagesStore.fetchAvailablePackages();
  }

  onCosmosPackagesStoreAvailableError(errorMessage) {
    this.setState({errorMessage});
  }

  onCosmosPackagesStoreAvailableSuccess() {
    this.setState({errorMessage: false, isLoading: false});
  }

  handleDetailOpen(cosmosPackage, event) {
    event.stopPropagation();
    this.context.router.transitionTo(
      'universe-packages-detail',
      {packageName: cosmosPackage.get('name')},
      {version: cosmosPackage.get('currentVersion')}
    );
  }

  handleInstallModalClose() {
    this.setState({installModalPackage: null});
  }

  handleInstallModalOpen(cosmosPackage, event) {
    event.stopPropagation();
    this.setState({installModalPackage: cosmosPackage});
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  getErrorScreen() {
    let header, message;
    let error = CosmosMessages[this.state.errorMessage.type];
    if (error) {
      header = error.header;
      message = (
        <p className="inverse text-align-center flush-bottom">
          {error.getMessage(this.state.errorMessage.name)}
        </p>
      );
    }

    return <RequestErrorMsg message={message} header={header} />;
  }

  getButton(cosmosPackage) {
    return (
      <button
        className="button button-success"
        onClick={this.handleInstallModalOpen.bind(this, cosmosPackage)}>
        Install Package
      </button>
    );
  }

  getIcon(cosmosPackage) {
    return (
      <div className="icon icon-jumbo icon-image-container icon-app-container">
        <img src={cosmosPackage.getIcons()['icon-medium']} />
      </div>
    );
  }

  getLoadingScreen() {
    return (
      <div className="container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  getSelectedPackages(packages) {
    let {searchString} = this.state;
    if (searchString) {
      return null;
    }

    return packages.getItems().map((cosmosPackage, index) => {
      return (
        <div
          className="grid-item column-mini-6 column-medium-4 column-large-3"
          key={index}>
          <Panel
            className="panel clickable"
            contentClass="panel-content horizontal-center"
            footer={this.getButton(cosmosPackage)}
            footerClass="panel-footer horizontal-center panel-footer-no-top-border flush-top"
            onClick={this.handleDetailOpen.bind(this, cosmosPackage)}>
            {this.getIcon(cosmosPackage)}
            <div className="h2 inverse short">
              {cosmosPackage.get('name')}
            </div>
            <p className="inverse flush">
              {cosmosPackage.get('currentVersion')}
            </p>
          </Panel>
        </div>
      );
    });
  }

  getBorderedTitle(title, hasMarginBottom) {
    let styles = {borderBottom: '1px solid #404040', paddingBottom: '15px'};
    if (!hasMarginBottom) {
      styles.marginBottom = '0';
    }

    return (
      <h4 style={styles} className="inverse">{title}</h4>
    );
  }

  getSelectedPackagesGrid(packages) {
    if (this.state.searchString) {
      return null;
    }

    return (
      <div>
        {this.getBorderedTitle('Selected Packages', true)}
        <div className="grid row">
          {this.getSelectedPackages(packages)}
        </div>
      </div>
    );
  }

  getPackagesTable(packages) {
    let title = 'Community Packages';

    if (this.state.searchString) {
      let foundPackagesLength = packages.getItems().length;
      let packagesWord = StringUtil.pluralize('package', foundPackagesLength);

      title = `${packages.getItems().length} ${packagesWord} found`;
    }

    return (
      <div>
        {this.getBorderedTitle(title, false)}
        <DisplayPackagesTable
          onDeploy={this.handleInstallModalOpen.bind(this)}
          onDetailOpen={this.handleDetailOpen.bind(this)}
          packages={packages} />
      </div>
    );
  }

  render() {
    let {state} = this;
    if (state.errorMessage) {
      return this.getErrorScreen();
    }

    if (state.isLoading) {
      return this.getLoadingScreen();
    }

    if (state.installModalPackage) {
      packageName = state.installModalPackage.get('name');
      packageVersion = state.installModalPackage.get('currentVersion');
    }

    let packageName, packageVersion;
    let packages = CosmosPackagesStore.getAvailablePackages();
    let splitPackages = packages.getSelectedAndNonSelectedPackages();

    let tablePackages = splitPackages.nonSelectedPackages;
    let gridPackages = splitPackages.selectedPackages;

    if (state.searchString) {
      tablePackages = packages.filterItems(state.searchString);
    }

    return (
      <div>
        <div className="control-group form-group flex-no-shrink flex-align-right flush-bottom">
          <FilterInputText
            className="flex-grow"
            placeholder="Search"
            searchString={state.searchString}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={true} />
        </div>
        {this.getSelectedPackagesGrid(gridPackages)}
        {this.getPackagesTable(tablePackages)}
        <InstallPackageModal
          open={!!state.installModalPackage}
          packageName={packageName}
          packageVersion={packageVersion}
          onClose={this.handleInstallModalClose}/>
      </div>
    );
  }
}

PackagesTab.contextTypes = {
  router: React.PropTypes.func
};

module.exports = PackagesTab;
