import {
	DefaultPortModel,
	DefaultLinkFactory,
	DefaultLinkModel,
	DefaultLinkWidget,
	DefaultPortFactory,
} from '@projectstorm/react-diagrams';
import { LinkWidget} from '@projectstorm/react-diagrams-core';
import * as React from 'react';
import styled from '@emotion/styled';

const S = {
	Label: styled.div`
	  user-select: none;
	  pointer-events: auto;
	`,
  };

// Create a custom link model that extends DefaultLinkModel
class AdvancedLinkModel extends DefaultLinkModel {
	
	constructor(options = {}) {
		super({
		  ...options,
		  type: 'advanced',
		});
		this.label= options.label || '';
	}
	serialize() {
		return {
			...super.serialize(),
			label: this.label
		};
	}

	deserialize(event) {
		super.deserialize(event);
		this.label = event.data.label;
	}
}
  

// Create a custom port model that extends DefaultPortModel
class AdvancedPortModel extends DefaultPortModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'advanced', // Set the type to 'advanced'
		});
	}
	createLinkModel() {
		return new AdvancedLinkModel({
			label: 'Write details about the relation here', // default label value
		});;
	}
}
class AdvancedPortFactory extends DefaultPortFactory {
	constructor() {
		super('advanced');
	}
  
	// Override the getNewInstance method to create an instance of your AdvancedPortModel
	  getNewInstance(initialConfig) {
		return new AdvancedPortModel({
		  ...initialConfig,
		  in: initialConfig.in,
		  name: initialConfig.name,
		});
	  }
	generateModel(event) {
		return new AdvancedPortModel();
	  }
	getType() {
		return 'advanced';
	  }
	  
  }

// CustomLinkArrowWidget is a component that renders the arrow for the link
const CustomLinkArrowWidget = (props) => {
	const { point, previousPoint } = props;
	// Calculate the angle of the arrow based on the link direction
	const angle =
		90 +
		(Math.atan2(
			point.getPosition().y - previousPoint.getPosition().y,
			point.getPosition().x - previousPoint.getPosition().x
		) *
			180) /
			Math.PI;

	// Return the JSX for the arrow
	return (
		<g className="arrow" transform={`translate(${point.getPosition().x}, ${point.getPosition().y})`}>
			<g style={{ transform: `rotate(${angle}deg)` }}>
				<g transform="translate(0, -3)">
					<polygon
						points="0,10 8,30 -8,30"
						fill={props.color}
						data-id={point.getID()}
						data-linkid={point.getLink().getID()}
					/>
				</g>
			</g>
		</g>
	);
};

// Create a custom link widget that extends DefaultLinkWidget
class AdvancedLinkWidget extends DefaultLinkWidget {
	
	handleLabelChange = (event) => {
		const newLabel = event.target.value;
		this.props.link.label=newLabel;
		this.forceUpdate(); 
	};
	handleTextareaKeyDown = (event) => {
		// This is done to preven the link the label is attached to from being deleted when Backspace or Delete keys are pressed
		if (event.key === 'Backspace' || event.key === 'Delete') {
		  event.stopPropagation();
		}
	};
	generateArrow(point, previousPoint) {
		return (
			<CustomLinkArrowWidget
				key={point.getID()}
				point={point}
				previousPoint={previousPoint}
				colorSelected={this.props.link.getOptions().selectedColor}
				color={this.props.link.getOptions().color}
			/>
		);
	}
	
	render() {
		// Ensure id is present for all points on the path
		const points = this.props.link.getPoints();
		const paths = [];
		this.refPaths = [];
		
		// Draw the multiple anchors and complex line
		for (let j = 0; j < points.length - 1; j++) {
			paths.push(
				this.generateLink(
					LinkWidget.generateLinePath(points[j], points[j + 1]),
					{
						'data-linkid': this.props.link.getID(),
						'data-point': j,
						onMouseDown: (event) => {
							this.addPointToLink(event, j + 1);
						}
					},
					j
				)
			);
		}

		// Render the circles for each intermediate point
		for (let i = 1; i < points.length - 1; i++) {
			paths.push(this.generatePoint(points[i]));
		}

		// Render the arrow only when connected to port
		if (this.props.link.getTargetPort() !== null) {
			paths.push(this.generateArrow(points[points.length - 1], points[points.length - 2],points[0]));
		} else { // else render an anchor point so it can be connected after letting go for the first time
			paths.push(this.generatePoint(points[points.length - 1]));
		}
		
		let labelX = 0;
		let labelY = 0;
	
		for (const point of points) {
		  labelX += point.getPosition().x;
		  labelY += point.getPosition().y;
		}
	
		labelX /= points.length;
		labelY /= points.length;

		return<React.Fragment>
			<g data-default-link-test={this.props.link.getOptions().testName}>{paths}</g>
			<foreignObject x={labelX - 25} y={labelY - 10} width="100%" height="100%">
				<S.Label>
					<textarea
						value={this.props.link.label}
						onChange={this.handleLabelChange}
						onKeyDown={this.handleTextareaKeyDown}
					/>
				</S.Label>
			</foreignObject>
		</React.Fragment> ;
	}
}

// Create a custom link factory that extends DefaultLinkFactory
class AdvancedLinkFactory extends DefaultLinkFactory {
	constructor() {
		super('advanced');
	}
	generateModel(event) {
		return new AdvancedLinkModel(); // Create an instance of AdvancedLinkModel
	  }
	  generateReactWidget(event) {
		const sourcePort = event.model.sourcePort;
		// Check if the source port exists and is an input port
		if (sourcePort && sourcePort.getOptions().in) {
		  // If it's an input port, no link is rendered
		  return null;
		}
	
		// If it's not an input port, create the link as usual
		return <AdvancedLinkWidget link={event.model} diagramEngine={this.engine} />;
	  }
}

export {AdvancedLinkFactory, AdvancedPortModel,AdvancedPortFactory};