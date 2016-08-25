/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import FormUtil from '../../../../../../src/js/utils/FormUtil';
import NetworkValidatorUtil from '../../../../../../src/js/utils/NetworkValidatorUtil';

const DISABLED_LB_PORT_FIELD_VALUE = 'Not Enabled';

const Networking = {
  type: 'object',
  title: 'Network',
  description: 'Configure the networking for your service.',
  properties: {
    networkType: {
      fieldType: 'select',
      title: 'Network Type',
      options: [
        {html: 'Host (Default)', id: 'host'},
        {html: 'Bridge', id: 'bridge'}
      ],
      getter(service) {
        let ipAddress = service.getIpAddress();
        if (ipAddress) {

          return ipAddress.networkName;
        }

        let container = service.getContainerSettings();
        if (container && container.docker && container.docker.network) {

          return container.docker.network.toLowerCase();
        }

        return 'host';
      },
      filterProperties(currentValue, definition, model) {
        // Hide this definition when model values dictate
        if (model.containerSettings
          && model.containerSettings.image != null
          && model.containerSettings.image.length) {

          definition.formElementClass = '';
        } else {
          definition.formElementClass = 'hidden-form-element';
          model.networking.networkType = 'host';
        }
      }
    },
    ports: {
      title: 'Service Endpoints',
      description: (
        <span>
          Configure the ports and endpoints you would like to use to talk to your service, or we can assign a random port for you. <a href="https://docs.mesosphere.com/overview/service-discovery/" target="_blank">Learn more about ports</a>.
        </span>
      ),
      type: 'array',
      duplicable: true,
      addLabel: 'Add an endpoint',
      getter(service) {
        let container = service.getContainerSettings();
        let portMappings = null;
        if (container && container.docker && container.docker.portMappings) {
          portMappings = container.docker.portMappings;
        }

        if (portMappings == null) {
          portMappings = service.getPortDefinitions();

          if (portMappings == null) {
            return null;
          }
        }

        return portMappings.map(function (portMapping) {
          return {
            lbPort: portMapping.port || portMapping.containerPort,
            name: portMapping.name,
            protocol: portMapping.protocol,
            discovery: portMapping.labels &&
              Object.keys(portMapping.labels).length > 0,
            expose: portMapping.hostPort != null
          };
        });
      },
      filterProperties(service = {}, instanceDefinition, model) {
        let {properties} = Networking.properties.ports.itemShape;
        const disabledLBPortFieldValue = service.lbPort ||
          DISABLED_LB_PORT_FIELD_VALUE;

        instanceDefinition.forEach(function (definition) {
          let prop = definition.name;
          if (FormUtil.isFieldInstanceOfProp('ports', definition)) {
            prop = FormUtil.getPropKey(definition.name);
          }

          if (properties[prop].shouldShow) {
            definition.formElementClass = {
              'hidden-form-element': !properties[prop].shouldShow(
                service, model || {networking: {}})
            };
          }

          if (prop !== 'lbPort' || !model || !model.networking) {
            return;
          }

          if (model.networking.networkType !== 'host') {
            definition.showLabel = 'Container Port';
            if (definition.value === DISABLED_LB_PORT_FIELD_VALUE) {
              delete definition.value;
              definition.disabled = false;
              definition.className = 'form-control';
              definition.fieldType = 'number';
            }
          }

          if (model.networking.networkType === 'host') {
            definition.showLabel = 'LB Port';

            // show as input
            if (service.discovery && definition.value === DISABLED_LB_PORT_FIELD_VALUE) {
              delete definition.value;
              definition.disabled = false;
              definition.className = 'form-control';
              definition.fieldType = 'number';
            }

            // show as disabled
            if (!service.discovery) {
              definition.value = disabledLBPortFieldValue;
              definition.disabled = true;
              definition.fieldType = 'text';
              definition.className = 'form-control lb-port-input-field-disabled';
            }
          }
        });
      },
      itemShape: {
        properties: {
          lbPort: {
            title: 'LB Port',
            type: 'number',
            externalValidator({networking}, definition) {
              const {[definition.name]: port} = networking;

              if (port === DISABLED_LB_PORT_FIELD_VALUE ||
                NetworkValidatorUtil.isValidPort(port)) {
                return true;
              }

              definition.showError =
                'LB Port  must be a number between 0 and 65535.';

              return false;
            }
          },
          name: {
            title: 'Name',
            type: 'string'
          },
          protocol: {
            title: 'Protocol',
            type: 'string',
            fieldType: 'select',
            default: 'tcp',
            options: ['tcp', 'udp', 'udp,tcp']
          },
          discovery: {
            label: 'Discovery',
            showLabel: false,
            title: 'Discovery',
            type: 'boolean',
            className: 'form-row-element-mixed-label-presence'
          }
        }
      }
    }
  }
};

module.exports = Networking;
