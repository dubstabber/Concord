import { useAuthStore } from "../store/useAuthStore";

const ProfilePage = () => {
  const { authUser } = useAuthStore();

  if (!authUser) {
    return <div className="p-8 text-center">Please login to view your profile</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title mb-4">User Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-base-content/60">Full Name</label>
              <p className="font-medium">{authUser.fullName}</p>
            </div>
            <div>
              <label className="text-sm text-base-content/60">Email</label>
              <p className="font-medium">{authUser.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
