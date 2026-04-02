//@flow
import React from 'react';
import axios from 'axios';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import FlatButton from '../../UI/FlatButton';
import { ResourceStore } from '../../AssetStore/ResourceStore';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import { useIsMounted } from '../../Utils/UseIsMounted';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { ResourceStoreContext } from '../../AssetStore/ResourceStore/ResourceStoreContext';
import CompactPropertiesEditorRowField from '../../CompactPropertiesEditor/CompactPropertiesEditorRowField';
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
import IconButton from '../../UI/IconButton';
import EditIcon from '../../UI/CustomSvgIcons/Edit';
import { LineStackLayout } from '../../UI/Layout';

const styles = {
  icon: {
    fontSize: 18,
  },
};

const downloadSvgAsBase64 = async (url: string): Promise<string> => {
  try {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const image = btoa(
      new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );
    if (image.length > 100 * 1024) {
      throw new Error(
        `Icon is too big (size after base64 conversion: ${image.length})`
      );
    }

    const contentType = response.headers
      ? response.headers['content-type'].toLowerCase()
      : '';
    if (contentType !== 'image/svg+xml')
      throw new Error(
        `Wrong content type. Got: "${contentType}", expected "image/svg+xml"`
      );

    return `data:${contentType};base64,${image}`;
  } catch (err) {
    console.error('Unable to import the icon.', err);
    throw err;
  }
};

type Props = {|
  onLoadChange: (isLoading: boolean) => void,
  isLoading: boolean,
  getPreviewIconUrl: () => string,
  setPreviewIconUrl: string => void,
  setIconUrl: string => void,
  placeholder?: string,
  disabled?: boolean,
|};

export const CompactIconField = ({
  onLoadChange,
  isLoading,
  getPreviewIconUrl,
  setPreviewIconUrl,
  setIconUrl,
  placeholder,
  disabled,
}: Props): React.Node => {
  const [resourceStoreOpen, setResourceStoreOpen] = React.useState(false);
  const isMounted = useIsMounted();
  const { searchResults } = React.useContext(ResourceStoreContext);
  const [
    selectedSvgResourceIndex,
    setSelectedSvgResourceIndex,
  ] = React.useState<?number>(null);

  const onUseIcon = React.useCallback(
    (i18n: I18nType) => {
      if (typeof selectedSvgResourceIndex !== 'number') return;
      const selectedSvgResource = searchResults
        ? searchResults[selectedSvgResourceIndex]
        : null;
      if (!selectedSvgResource) return;
      setResourceStoreOpen(false);
      onLoadChange(true);
      downloadSvgAsBase64(selectedSvgResource.url)
        .then(
          base64Svg => {
            if (!isMounted.current) return;

            setPreviewIconUrl(selectedSvgResource.url);
            setIconUrl(base64Svg);
          },
          rawError => {
            if (!isMounted.current) return;

            showErrorBox({
              message: i18n._(
                t`Unable to download the icon. Verify your internet connection or try again later.`
              ),
              rawError,
              errorId: 'icon-download-error',
            });
          }
        )
        .then(() => {
          if (!isMounted.current) return;

          onLoadChange(false);
        });
    },
    [
      selectedSvgResourceIndex,
      searchResults,
      onLoadChange,
      isMounted,
      setPreviewIconUrl,
      setIconUrl,
    ]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <React.Fragment>
          <LineStackLayout noMargin expand>
            <CompactPropertiesEditorRowField
              label={i18n._(t`Icon URL`)}
              field={
                <CompactSemiControlledTextField
                  value={getPreviewIconUrl()}
                  onChange={text => {
                    setPreviewIconUrl(text);
                  }}
                  placeholder={placeholder}
                  disabled
                />
              }
            />
            <IconButton
              size="small"
              onClick={() => {
                setResourceStoreOpen(true);
              }}
              disabled={disabled}
            >
              <EditIcon style={styles.icon} />
            </IconButton>
          </LineStackLayout>
          {resourceStoreOpen && (
            <Dialog
              title={<Trans>Choose an icon</Trans>}
              actions={[
                <FlatButton
                  key="cancel"
                  label={<Trans>Cancel</Trans>}
                  primary={false}
                  onClick={() => {
                    setResourceStoreOpen(false);
                  }}
                />,
                <DialogPrimaryButton
                  primary
                  key="apply"
                  label={<Trans>Use icon</Trans>}
                  onClick={() => onUseIcon(i18n)}
                />,
              ]}
              flexColumnBody
              fullHeight
              open
              onRequestClose={() => {
                setResourceStoreOpen(false);
              }}
            >
              <ResourceStore
                selectedResourceIndex={selectedSvgResourceIndex}
                onSelectResource={setSelectedSvgResourceIndex}
                resourceKind={'svg'}
              />
            </Dialog>
          )}
        </React.Fragment>
      )}
    </I18n>
  );
};
