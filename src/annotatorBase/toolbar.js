import React from 'react';


class Toolbar extends React.Component {
  renderEditSection() {
    const { editButton, deleteButton } = this.props;
    return (
      <>
        <div className="px-1" style={{ borderLeft: '1px solid grey' }} />
        {editButton()}
        {deleteButton()}
      </>
    );
  }

  render() {
    const { state, states, selectButton, createButton, eraseButton } = this.props;

    return (
      <div className="col p-2">
        {selectButton()}
        {createButton()}
        {eraseButton()}
        {state === states.EDIT
          ? this.renderEditSection()
          : null
        }
      </div>
    );
  }
}


export default Toolbar;
