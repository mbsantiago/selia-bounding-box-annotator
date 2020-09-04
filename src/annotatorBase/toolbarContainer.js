import React from 'react';


const styles = {
  button: {
    default: 'btn btn-light m-1',
    active: 'btn btn-primary m-1',
    warning: 'btn btn-warning m-1',
    danger: 'btn btn-text text-danger m-1',
  },
};


class ToolbarContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: props.active,
      activator: props.activator,
      state: props.state,
    };

    this.states = props.states;
    this.styles = props.styles || styles;
  }

  getClassName(other) {
    const { state, active } = this.state;
    if (!active) return this.styles.button.default;
    return state === other ? this.styles.button.active : this.styles.button.default;
  }

  handleClick(state) {
    const { setState, activator } = this.props;

    // Signal to the exterior that the annotator has been activated.
    activator();

    // Change state in parent component.
    setState(state);

    this.setState({
      state,
      active: true,
    });
  }

  handleMove() {
    this.state.activator();
    this.props.setState(this.states.MOVING);
    this.setState({ active: true, state: this.states.MOVING });
  }

  renderSelectButton() {
    const { states } = this.props;
    return (
      <button
        type="button"
        className={this.getClassName(states.SELECT)}
        onClick={() => this.handleClick(states.SELECT)}
      >
        <i className="fas fa-mouse-pointer" />
      </button>
    );
  }

  renderCreateButton() {
    const { states } = this.props;
    return (
      <button
        type="button"
        className={this.getClassName(states.CREATE)}
        onClick={() => this.handleClick(states.CREATE)}
      >
        <i className="fas fa-plus" />
      </button>
    );
  }

  renderEraseButton() {
    const { states } = this.props;
    return (
      <button
        type="button"
        className={this.getClassName(states.DELETE)}
        onClick={() => this.handleClick(states.DELETE)}
      >
        <i className="fas fa-eraser" />
      </button>
    );
  }

  renderEditButton() {
    const { states } = this.props;
    return (
      <button
        type="button"
        className={this.getClassName(states.EDIT)}
        onClick={() => this.handleClick(states.EDIT)}
      >
        <i className="fas fa-edit" />
      </button>
    );
  }

  renderDeleteButton() {
    const { deleteAnnotation } = this.props;
    return (
      <button
        type="button"
        className={this.styles.button.danger}
        onClick={() => deleteAnnotation()}
      >
        <i className="fas fa-trash" />
      </button>
    );
  }

  handleStateChange(state) {
    this.props.setState(state);
    this.setState({ state });
  }

  render() {
    const Component = this.props.component;
    return (
      <Component
        active={this.state.active}
        activator={this.state.activator}
        state={this.state.state}
        states={this.props.states}
        styles={this.styles}
        setState={(state) => this.handleStateChange(state)}
        selectButton={() => this.renderSelectButton()}
        createButton={() => this.renderCreateButton()}
        eraseButton={() => this.renderEraseButton()}
        editButton={() => this.renderEditButton()}
        deleteButton={() => this.renderDeleteButton()}
      />
    );
  }
}


export default ToolbarContainer;
