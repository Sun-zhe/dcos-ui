var _ = require("underscore");
var React = require("react/addons");
import {RouteHandler} from "react-router";

var AlertPanel = require("../components/AlertPanel");
import Config from "../config/Config";
var EventTypes = require("../constants/EventTypes");
var FilterHealth = require("../components/FilterHealth");
var FilterHeadline = require("../components/FilterHeadline");
var FilterInputText = require("../components/FilterInputText");
var InternalStorageMixin = require("../mixins/InternalStorageMixin");
var Page = require("../components/Page");
var MarathonStore = require("../stores/MarathonStore");
var MesosSummaryStore = require("../stores/MesosSummaryStore");
var ResourceBarChart = require("../components/charts/ResourceBarChart");
var ServiceTable = require("../components/ServiceTable");
var ServiceSidePanel = require("../components/ServiceSidePanel");
var SidebarActions = require("../events/SidebarActions");
import TaskSidePanel from "../components/TaskSidePanel";

function getCountByHealth(frameworks) {
  return _.foldl(frameworks, function (acc, framework) {
    let appHealth = MarathonStore.getServiceHealth(framework.name);
    if (acc[appHealth.value] === undefined) {
      acc[appHealth.value] = 1;
    } else {
      acc[appHealth.value]++;
    }
    return acc;
  }, {});
}

function getMesosServices(state) {
  let filters = _.pick(state, "searchString", "healthFilter");
  let states = MesosSummaryStore.get("states");
  let services = states.getActiveServices();
  let filteredServices = services.filter({
    health: filters.healthFilter,
    name: filters.searchString
  }).getItems();
  let serviceIDs = _.pluck(filteredServices, "id");

  return {
    services: filteredServices,
    successfulSnapshot: lastState.isSnapshotSuccessful(),
    totalServices: services.getItems().length,
    countByHealth: getCountByHealth(services.getItems()),
    statesProcessed: MesosSummaryStore.get("statesProcessed"),
    refreshRate: Config.getRefreshRate(),
    totalServiceResources: states.getResourceStatesForServiceIDs(serviceIDs),
    totalResources: states.last().getSlaveTotalResources()
  };
}

var DEFAULT_FILTER_OPTIONS = {
  searchString: "",
  healthFilter: null
};

var ServicesPage = React.createClass({

  displayName: "ServicesPage",

  mixins: [InternalStorageMixin],

  statics: {
    routeConfig: {
      label: "Services",
      icon: "services",
      matches: /^\/services/
    },

    // Static life cycle method from react router, that will be called
    // "when a handler is about to render", i.e. on route change:
    // https://github.com/rackt/react-router/
    // blob/master/docs/api/components/RouteHandler.md
    willTransitionTo: function () {
      SidebarActions.close();
    }
  },

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return _.extend({selectedResource: "cpus"}, DEFAULT_FILTER_OPTIONS);
  },

  componentWillMount: function () {
    this.internalStorage_set(getMesosServices(this.state));
    this.internalStorage_update({
      openServicePanel: false,
      openTaskPanel: false
    });
  },

  componentDidMount: function () {
    MesosSummaryStore.addChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE,
      this.onMesosStateChange
    );
    MesosSummaryStore.addChangeListener(
      EventTypes.MESOS_SUMMARY_REQUEST_ERROR,
      this.onMesosStateChange
    );

    this.internalStorage_update({
      openServicePanel: this.props.params.serviceName != null,
      openTaskPanel: this.props.params.taskID != null
    });
  },

  componentWillReceiveProps: function (nextProps) {
    this.internalStorage_update({
      openServicePanel: nextProps.params.serviceName != null,
      openTaskPanel: nextProps.params.taskID != null
    });
  },

  componentWillUnmount: function () {
    MesosSummaryStore.removeChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE,
      this.onMesosStateChange
    );
  },

  onMesosStateChange: function () {
    this.internalStorage_update(getMesosServices(this.state));
    this.forceUpdate();
  },

  handleHealthFilterChange: function (healthFilter) {
    var stateChanges = _.clone(DEFAULT_FILTER_OPTIONS);
    stateChanges.healthFilter = healthFilter;

    this.internalStorage_update(getMesosServices(stateChanges));
    this.setState(stateChanges);
  },

  onResourceSelectionChange: function (selectedResource) {
    if (this.state.selectedResource !== selectedResource) {
      this.setState({selectedResource: selectedResource});
    }
  },

  handleSearchStringChange: function (searchString) {
    var data = getMesosServices({
      searchString: searchString,
      healthFilter: this.state.healthFilter
    });

    this.internalStorage_update(data);
    this.setState({searchString: searchString});
  },

  resetFilter: function () {
    var state = _.clone(DEFAULT_FILTER_OPTIONS);
    this.internalStorage_update(getMesosServices(state));
    this.setState(state);
  },

  getServicesPageContent: function () {
    let state = this.state;
    let data = this.internalStorage_get();
    let appsProcessed = MarathonStore.hasProcessedApps();

    return (
      <div>
        <ResourceBarChart
          itemCount={data.services.length}
          resources={data.totalServiceResources}
          totalResources={data.totalResources}
          refreshRate={data.refreshRate}
          resourceType="Services"
          selectedResource={state.selectedResource}
          onResourceSelectionChange={this.onResourceSelectionChange} />
        <FilterHeadline
          onReset={this.resetFilter}
          name="Services"
          currentLength={data.services.length}
          totalLength={data.totalServices} />
        <ul className="list list-unstyled list-inline flush-bottom">
          <li>
            <FilterHealth
              countByHealth={data.countByHealth}
              healthFilter={state.healthFilter}
              handleFilterChange={this.handleHealthFilterChange}
              servicesLength={data.totalServices} />
          </li>
          <li>
            <FilterInputText
              searchString={state.searchString}
              handleFilterChange={this.handleSearchStringChange}
              inverseStyle={true} />
          </li>
        </ul>
        <ServiceTable
          services={data.services}
          healthProcessed={appsProcessed} />
        <ServiceSidePanel
          itemID={this.props.params.serviceName}
          open={data.statesProcessed && data.openServicePanel} />
        <TaskSidePanel
          itemID={this.props.params.taskID}
          open={data.statesProcessed && data.openTaskPanel} />
      </div>
    );
  },

  getEmptyServicesPageContent: function () {
    return (
      <AlertPanel title="No Services Installed">
        <p>Use the DCOS command line tools to find and install services.</p>
      </AlertPanel>
    );
  },

  getContents: function (isEmpty) {
    if (isEmpty) {
      return this.getEmptyServicesPageContent();
    } else {
      return this.getServicesPageContent();
    }
  },

  render: function () {
    var data = this.internalStorage_get();
    var isEmpty = data.statesProcessed && data.totalServices === 0 && data.successful;

    return (
      <Page title="Services">
        {this.getContents(isEmpty)}
        <RouteHandler />
      </Page>
    );
  }

});

module.exports = ServicesPage;
