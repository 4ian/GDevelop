// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { type CourseListingData } from '../../../../Utils/GDevelopServices/Shop';
import Dialog, { DialogPrimaryButton } from '../../../../UI/Dialog';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import CreateProfile from '../../../../Profile/CreateProfile';
import Text from '../../../../UI/Text';
import { useInterval } from '../../../../Utils/UseInterval';
import { getPurchaseCheckoutUrl } from '../../../../Utils/GDevelopServices/Shop';
import { type Course } from '../../../../Utils/GDevelopServices/Asset';
import Window from '../../../../Utils/Window';
import { Line, Spacer } from '../../../../UI/Grid';
import CircularProgress from '../../../../UI/CircularProgress';
import BackgroundText from '../../../../UI/BackgroundText';
import Mark from '../../../../UI/CustomSvgIcons/Mark';
import FlatButton from '../../../../UI/FlatButton';
import { LineStackLayout } from '../../../../UI/Layout';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import { extractGDevelopApiErrorStatusAndCode } from '../../../../Utils/GDevelopServices/Errors';
import PasswordPromptDialog from '../../../../AssetStore/PasswordPromptDialog';

type Props = {|
  course: Course,
  courseListingData: CourseListingData,
  onClose: () => void,
|};

const CoursePurchaseDialog = ({
  course,
  courseListingData,
  onClose,
}: Props) => {
  const {
    profile,
    onOpenLoginDialog,
    onOpenCreateAccountDialog,
    onPurchaseSuccessful,
    onRefreshCoursePurchases,
    coursePurchases,
    loginState,
  } = React.useContext(AuthenticatedUserContext);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [
    isCheckingPurchasesAfterLogin,
    setIsCheckingPurchasesAfterLogin,
  ] = React.useState(loginState === 'loggingIn');
  const [purchaseSuccessful, setPurchaseSuccessful] = React.useState(false);
  const [
    displayPasswordPrompt,
    setDisplayPasswordPrompt,
  ] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>('');
  const { showAlert } = useAlertDialog();

  const onStartPurchase = async () => {
    if (!profile) return;
    setDisplayPasswordPrompt(false);

    // Note: we don't handle purchasing a course through the App Store for now.

    const price = courseListingData.prices.find(
      price => price.usageType === 'default'
    );
    if (!price) {
      console.error('Unable to find the price for the usage type default');
      await showAlert({
        title: t`An error happened`,
        message: t`Unable to find the price for this course. Please try again later.`,
      });
      return;
    }

    try {
      setIsPurchasing(true);
      const checkoutUrl = getPurchaseCheckoutUrl({
        productId: courseListingData.id,
        priceName: price.name,
        userId: profile.id,
        userEmail: profile.email,
        ...(password ? { password } : undefined),
      });
      Window.openExternalURL(checkoutUrl);
    } catch (error) {
      const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
        error
      );
      if (
        extractedStatusAndCode &&
        extractedStatusAndCode.status === 403 &&
        extractedStatusAndCode.code === 'auth/wrong-password'
      ) {
        await showAlert({
          title: t`Operation not allowed`,
          message: t`The password you entered is incorrect. Please try again.`,
        });
      } else {
        console.error('Unable to get the checkout URL', error);
        await showAlert({
          title: t`An error happened`,
          message: t`Unable to get the checkout URL. Please try again later.`,
        });
      }
      setIsPurchasing(false);
    } finally {
      setPassword('');
    }
  };

  const onWillPurchase = () => {
    // Password is required in dev environment only so that one cannot freely purchase courses.
    if (Window.isDev()) setDisplayPasswordPrompt(true);
    else onStartPurchase();
  };

  React.useEffect(
    () => {
      onWillPurchase();
    },
    // Launch the start process directly when the dialog is opened, to avoid an extra click.
    // eslint-disable-next-line
    []
  );

  React.useEffect(
    () => {
      const checkIfPurchaseIsDone = async () => {
        if (
          isPurchasing &&
          coursePurchases &&
          coursePurchases.find(
            userPurchase => userPurchase.productId === courseListingData.id
          )
        ) {
          // We found the purchase, the user has bought the course.
          // We do not close the dialog yet, as we need to trigger a refresh of the products received.
          await onPurchaseSuccessful();
        }
      };
      checkIfPurchaseIsDone();
    },
    [
      isPurchasing,
      coursePurchases,
      courseListingData,
      onPurchaseSuccessful,
      onRefreshCoursePurchases,
    ]
  );

  useInterval(
    () => {
      onRefreshCoursePurchases();
    },
    isPurchasing ? 3900 : null
  );

  // Listen to the login state, to know when a user has just logged in and the courses are being fetched.
  // In this case, start a timeout to remove the loader and give some time for the courses to refresh.
  React.useEffect(
    () => {
      let timeoutId;
      (async () => {
        if (loginState === 'done') {
          timeoutId = setTimeout(
            () => setIsCheckingPurchasesAfterLogin(false),
            3000
          );
        }
      })();
      return () => {
        clearTimeout(timeoutId);
      };
    },
    [loginState]
  );

  // If the user has received this particular course, either:
  // - they just logged in, and already have it, so we close the dialog.
  // - they just bought it, we display the success message.
  React.useEffect(
    () => {
      if (course) {
        if (!course.isLocked) {
          if (isPurchasing) {
            setIsPurchasing(false);
            setPurchaseSuccessful(true);
          } else if (!purchaseSuccessful) {
            onClose();
          }
        }
      }
    },
    [course, courseListingData, isPurchasing, onClose, purchaseSuccessful]
  );

  const dialogContents = !profile
    ? {
        subtitle: <Trans>Log-in to purchase this course</Trans>,
        content: (
          <CreateProfile
            onOpenLoginDialog={onOpenLoginDialog}
            onOpenCreateAccountDialog={onOpenCreateAccountDialog}
            message={
              <Trans>
                Courses will be linked to your user account and available
                indefinitely. Log in or sign up to purchase this course or
                restore a previous purchase.
              </Trans>
            }
            justifyContent="center"
          />
        ),
      }
    : purchaseSuccessful
    ? {
        subtitle: <Trans>Your purchase has been processed!</Trans>,
        content: (
          <Line justifyContent="center" alignItems="center">
            <Text>
              <Trans>You can now go back to the course.</Trans>
            </Text>
          </Line>
        ),
      }
    : isPurchasing
    ? {
        subtitle: <Trans>Complete your payment on the web browser</Trans>,
        content: (
          <>
            <Line justifyContent="center" alignItems="center">
              <CircularProgress size={20} />
              <Spacer />
              <Text>
                <Trans>Waiting for the purchase confirmation...</Trans>
              </Text>
            </Line>
            <Spacer />
            <Line justifyContent="center">
              <BackgroundText>
                <Trans>
                  Once you're done, come back to GDevelop and the assets will be
                  added to your account automatically.
                </Trans>
              </BackgroundText>
            </Line>
          </>
        ),
      }
    : isCheckingPurchasesAfterLogin
    ? {
        subtitle: <Trans>Loading your profile...</Trans>,
        content: (
          <Line justifyContent="center" alignItems="center">
            <CircularProgress size={20} />
          </Line>
        ),
      }
    : {
        subtitle: (
          <Trans>
            The course {courseListingData.name} will be linked to your account{' '}
            {profile.email}.
          </Trans>
        ),
        content: (
          <Line justifyContent="center" alignItems="center">
            <Text>
              <Trans>
                A new secure window will open to complete the purchase.
              </Trans>
            </Text>
          </Line>
        ),
      };

  const allowPurchase =
    profile &&
    !isPurchasing &&
    !purchaseSuccessful &&
    !isCheckingPurchasesAfterLogin;
  const dialogActions = [
    <FlatButton
      key="cancel"
      label={purchaseSuccessful ? <Trans>Close</Trans> : <Trans>Cancel</Trans>}
      onClick={onClose}
    />,
    allowPurchase ? (
      <DialogPrimaryButton
        key="continue"
        primary
        label={<Trans>Continue</Trans>}
        onClick={onWillPurchase}
      />
    ) : null,
  ];

  return (
    <>
      <Dialog
        title={<Trans>{courseListingData.name}</Trans>}
        maxWidth="sm"
        open
        onRequestClose={onClose}
        actions={dialogActions}
        onApply={purchaseSuccessful ? onClose : onWillPurchase}
        cannotBeDismissed // Prevent the user from continuing by clicking outside.
        flexColumnBody
      >
        <LineStackLayout justifyContent="center" alignItems="center">
          {purchaseSuccessful && <Mark />}
          <Text size="sub-title">{dialogContents.subtitle}</Text>
        </LineStackLayout>
        {dialogContents.content}
      </Dialog>
      {displayPasswordPrompt && (
        <PasswordPromptDialog
          onApply={onStartPurchase}
          onClose={() => setDisplayPasswordPrompt(false)}
          passwordValue={password}
          setPasswordValue={setPassword}
        />
      )}
    </>
  );
};

export default CoursePurchaseDialog;
