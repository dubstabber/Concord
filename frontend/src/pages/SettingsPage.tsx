import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import type { SettingsFormData } from "../types";



const SettingsPage = () => {
  const [formData, setFormData] = useState<SettingsFormData>({
    theme: "light",
    notifications: true,
    language: "english",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      toast.success("Settings saved successfully");
      setIsSaving(false);
    }, 1000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Theme</span>
                </label>
                <select 
                  name="theme" 
                  className="select select-bordered w-full" 
                  value={formData.theme}
                  onChange={handleChange}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input 
                    type="checkbox" 
                    name="notifications"
                    className="checkbox" 
                    checked={formData.notifications}
                    onChange={handleChange}
                  />
                  <span className="label-text font-medium">Enable Notifications</span>
                </label>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Language</span>
                </label>
                <select 
                  name="language" 
                  className="select select-bordered w-full" 
                  value={formData.language}
                  onChange={handleChange}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-full mt-6" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
