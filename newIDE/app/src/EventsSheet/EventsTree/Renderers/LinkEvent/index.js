// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import IconButton from '../../../../UI/IconButton';
import classNames from 'classnames';
import {
  largeSelectedArea,
  largeSelectableArea,
  selectableArea,
  linkContainer,
  disabledText,
} from '../../ClassNames';
import InlinePopover from '../../../InlinePopover';
import ExternalEventsAutoComplete from './ExternalEventsAutoComplete';
import { showWarningBox } from '../../../../UI/Messages/MessageBox';
import { type EventRendererProps } from '../EventRenderer';
import { shouldActivate } from '../../../../UI/KeyboardShortcuts/InteractionKeys';
import ShareExternal from '../../../../UI/CustomSvgIcons/ShareExternal';
const gd: libGDevelop = global.gd;

const styles = {
  container: {
    height: '4em',
    display: 'flex',
    alignItems: 'center',
    padding: 5,
  },
  title: {
    fontSize: '1.2em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  openInNewIcon: {
    fontSize: '1.5em',
  },
};

export default class LinkEvent extends React.Component<EventRendererProps, *> {
  _externalEventsAutoComplete: ?ExternalEventsAutoComplete = null;

  state = {
    editing: false,
    editingPreviousValue: null,
    anchorEl: null,
  };

  edit = (domEvent: any) => {
    const linkEvent = gd.asLinkEvent(this.props.event);
    const target = linkEvent.getTarget();

    // We should not need to use a timeout, but
    // if we don't do this, the InlinePopover's clickaway listener
    // is immediately picking up the event and closing.
    // Search the rest of the codebase for inlinepopover-event-hack
    const anchorEl = domEvent.currentTarget;
    setTimeout(
      () =>
        this.setState(
          {
            editing: true,
            editingPreviousValue: target,
            anchorEl,
          },
          () => {
            // Give a bit of time for the popover to mount itself
            setTimeout(() => {
              if (this._externalEventsAutoComplete)
                this._externalEventsAutoComplete.focus();
            }, 10);
          }
        ),
      10
    );
  };

  openTarget = (i18n: I18nType) => {
    const { project, event, onOpenLayout, onOpenExternalEvents } = this.props;
    const linkEvent = gd.asLinkEvent(event);
    const target = linkEvent.getTarget();

    if (project.hasExternalEventsNamed(target)) {
      onOpenExternalEvents(target);
    } else if (project.hasLayoutNamed(target)) {
      onOpenLayout(target);
    } else {
      showWarningBox(
        i18n._(
          t`The specified external events do not exist in the game. Be sure that the name is correctly spelled or create them using the project manager.`
        )
      );
    }
  };

  cancelEditing = () => {
    this.endEditing();

    const linkEvent = gd.asLinkEvent(this.props.event);
    const { editingPreviousValue } = this.state;
    if (editingPreviousValue != null) {
      linkEvent.setTarget(editingPreviousValue);
      this.forceUpdate();
    }
  };

  endEditing = () => {
    const { anchorEl } = this.state;
    const linkEvent = gd.asLinkEvent(this.props.event);

    // Put back the focus after closing the inline popover.
    // $FlowFixMe
    if (anchorEl) anchorEl.focus();
    if (this.state.editingPreviousValue !== linkEvent.getTarget()) {
      this.props.onEndEditingEvent();
    }
    this.setState({
      editing: false,
      editingPreviousValue: null,
      anchorEl: null,
    });
  };

  render() {
    const linkEvent = gd.asLinkEvent(this.props.event);
    const target = linkEvent.getTarget();

    return (
      <I18n>
        {({ i18n }) => (
          <div
            className={classNames({
              [largeSelectableArea]: true,
              [largeSelectedArea]: this.props.selected,
              [linkContainer]: true,
            })}
            style={styles.container}
            id={`${this.props.idPrefix}-link`}
          >
            <span
              style={styles.title}
              className={classNames({
                [disabledText]: this.props.disabled,
              })}
            >
              {this.props.scope.layout ? (
                <>
                  <Trans>Include events from</Trans>{' '}
                  <i
                    className={classNames({
                      [selectableArea]: true,
                    })}
                    onClick={this.edit}
                    onKeyPress={event => {
                      if (shouldActivate(event)) {
                        this.edit(event);
                      }
                    }}
                    tabIndex={0}
                  >
                    {target || (
                      <Trans>{`<Enter the name of external events>`}</Trans>
                    )}
                  </i>{' '}
                </>
              ) : (
                <Trans>Links can't be used outside of a scene.</Trans>
              )}
            </span>
            <IconButton
              onClick={() => this.openTarget(i18n)}
              disabled={!target}
            >
              <ShareExternal style={styles.openInNewIcon} />
            </IconButton>
            <InlinePopover
              open={this.state.editing}
              anchorEl={this.state.anchorEl}
              onRequestClose={this.cancelEditing}
              onApply={this.endEditing}
            >
              <ExternalEventsAutoComplete
                project={this.props.project}
                value={target}
                sceneName={
                  this.props.scope.layout
                    ? this.props.scope.layout.getName()
                    : undefined
                }
                externalEventsName={
                  this.props.scope.externalEvents
                    ? this.props.scope.externalEvents.getName()
                    : undefined
                }
                onChange={text => {
                  linkEvent.setTarget(text);
                  this.props.onUpdate();
                }}
                isInline
                onRequestClose={this.cancelEditing}
                onApply={this.endEditing}
                ref={externalEventsAutoComplete =>
                  (this._externalEventsAutoComplete = externalEventsAutoComplete)
                }
              />
            </InlinePopover>
          </div>
        )}
      </I18n>
    );
  }
}
