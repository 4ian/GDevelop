// TODO: add flow
import createReactContext, { type Context } from 'create-react-context';

export type UserProfile = {|
  authenticated: boolean,
  profile: ?Profile,
  limits: ?Limits,
  usages: ?Usages,
  subscription: ?Subscription,
  onLogout: () => void,
  onLogin: () => void,
  onRefreshUserProfile: () => void,
|};

export const initialUserProfile = {
  authenticated: false,
  profile: null,
  subscription: null,
  usages: null,
  limits: null,
  onLogout: () => {},
  onLogin: () => {},
  onRefreshUserProfile: () => {},
};

const UserProfileContext: Context<UserProfile> = createReactContext(
  initialUserProfile
);

export default UserProfileContext;
