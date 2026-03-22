import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Camera, LogOut, Trash2, UserCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { profilePhotoService } from '../services/supabaseClient';

function getProfilePhotoFallbackKey(userId: string) {
  return `profile_photo_${userId}`;
}

function isBucketNotFoundError(error: any) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('bucket not found');
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image preview.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to convert image preview.'));
    reader.readAsDataURL(blob);
  });
}

async function resizeAndCropToSquare(file: File, outputSize = 512): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const imageElement = new Image();
      imageElement.onload = () => resolve(imageElement);
      imageElement.onerror = () => reject(new Error('Failed to load selected image.'));
      imageElement.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to initialize image processor.');
    }

    const minSide = Math.min(img.width, img.height);
    const sx = (img.width - minSide) / 2;
    const sy = (img.height - minSide) / 2;

    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, outputSize, outputSize);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });

    if (!blob) {
      throw new Error('Failed to process image.');
    }

    return blob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const userId = useMemo(() => {
    return user?.id || null;
  }, [user]);

  useEffect(() => {
    if (!userId) {
      setPhotoUrl(null);
      return;
    }

    setLoadingPhoto(true);
    setErrorMessage('');

    profilePhotoService
      .getProfilePhotoUrl(userId)
      .then((url) => {
        if (url) {
          setPhotoUrl(url);
          return;
        }

        // Fallback to local cached photo when bucket is not configured yet.
        const fallback = localStorage.getItem(getProfilePhotoFallbackKey(userId));
        setPhotoUrl(fallback);
      })
      .catch((error) => {
        console.warn('Failed to load profile photo:', error);

        if (isBucketNotFoundError(error)) {
          const fallback = localStorage.getItem(getProfilePhotoFallbackKey(userId));
          setPhotoUrl(fallback);
          return;
        }

        setPhotoUrl(null);
      })
      .finally(() => setLoadingPhoto(false));
  }, [userId]);

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) {
      return;
    }

    setSavingPhoto(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const processedBlob = await resizeAndCropToSquare(file, 512);
      try {
        await profilePhotoService.uploadProfilePhoto(userId, processedBlob);
        const signedUrl = await profilePhotoService.getProfilePhotoUrl(userId);
        setPhotoUrl(signedUrl);
        setSuccessMessage('Profile photo updated successfully.');
      } catch (storageError: any) {
        if (!isBucketNotFoundError(storageError)) {
          throw storageError;
        }

        const fallbackDataUrl = await blobToDataUrl(processedBlob);
        localStorage.setItem(getProfilePhotoFallbackKey(userId), fallbackDataUrl);
        setPhotoUrl(fallbackDataUrl);
        setSuccessMessage('Photo saved locally. Configure Supabase bucket to sync to cloud.');
      }
    } catch (error: any) {
      console.error('Failed to update profile photo:', error);
      setErrorMessage(
        error?.message ||
          'Failed to upload profile photo. Check Supabase bucket and policies.'
      );
    } finally {
      setSavingPhoto(false);
      event.target.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!userId) {
      return;
    }

    setSavingPhoto(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      try {
        await profilePhotoService.deleteProfilePhoto(userId);
      } catch (storageError: any) {
        if (!isBucketNotFoundError(storageError)) {
          throw storageError;
        }
      }

      localStorage.removeItem(getProfilePhotoFallbackKey(userId));
      setPhotoUrl(null);
      setSuccessMessage('Profile photo removed.');
    } catch (error: any) {
      console.error('Failed to delete profile photo:', error);
      setErrorMessage(
        error?.message ||
          'Failed to delete profile photo. Check Supabase bucket and policies.'
      );
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="px-4 pt-6">
        <div className="bg-white rounded-3xl shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600 mb-6">Please login to view and manage your trainer profile.</p>
          <Button
            onClick={() => navigate('/login')}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="bg-white rounded-3xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>

        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-100 flex items-center justify-center">
              {loadingPhoto ? (
                <span className="text-xs text-gray-500">Loading...</span>
              ) : photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle2 className="w-20 h-20 text-gray-400" />
              )}
            </div>

            <label
              htmlFor="profile-photo-input"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 cursor-pointer text-white flex items-center justify-center shadow disabled:opacity-60"
              title="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </label>
          </div>

          <input
            id="profile-photo-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            disabled={savingPhoto}
            className="hidden"
          />

          <p className="mt-4 text-sm text-gray-500">Tap camera icon to change photo</p>

          {photoUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDeletePhoto}
              disabled={savingPhoto}
              className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Photo
            </Button>
          )}

          {errorMessage && (
            <p className="mt-3 text-sm text-red-600 text-center">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="mt-3 text-sm text-green-600 text-center">{successMessage}</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Email</p>
          <p className="text-gray-900 font-semibold break-all">{user.email}</p>
          <p className="text-sm text-gray-500 mt-2">Logged in as trainer</p>
        </div>

        <Button
          onClick={handleLogout}
          disabled={savingPhoto}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
