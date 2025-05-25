
import { useState } from 'react';
import {
  Eye,
  User,
  ArrowLeft,
  Camera,
  Edit3,
  Star,
  Trash2,
  Play,
  Bell,
  Shield,
  Palette,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link } from 'react-router';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

const watchlistMovies = [
  {
    id: 1,
    title: 'Dune: Part Two',
    image: '/placeholder.svg?height=120&width=80',
    year: '2024',
    rating: 4.6,
    tags: ['Epic', 'Sci-Fi', 'Adventure'],
    addedDate: '2024-01-15',
  },
  {
    id: 2,
    title: 'Past Lives',
    image: '/placeholder.svg?height=120&width=80',
    year: '2023',
    rating: 4.4,
    tags: ['Romance', 'Melancholy', 'Reflection'],
    addedDate: '2024-01-10',
  },
  {
    id: 3,
    title: 'Everything Everywhere All at Once',
    image: '/placeholder.svg?height=120&width=80',
    year: '2022',
    rating: 4.5,
    tags: ['Surreal', 'Family', 'Adventure'],
    addedDate: '2024-01-08',
  },
];

const watchHistory = [
  {
    id: 1,
    title: 'The Bear',
    image: '/placeholder.svg?height=120&width=80',
    year: '2022',
    rating: 4.8,
    watchedDate: '2024-01-20',
    yourRating: 5,
    tags: ['Stress', 'Kitchen', 'Growth'],
  },
  {
    id: 2,
    title: 'Aftersun',
    image: '/placeholder.svg?height=120&width=80',
    year: '2022',
    rating: 4.3,
    watchedDate: '2024-01-18',
    yourRating: 4,
    tags: ['Memory', 'Father-Daughter', 'Bittersweet'],
  },
  {
    id: 3,
    title: 'Top Gun: Maverick',
    image: '/placeholder.svg?height=120&width=80',
    year: '2022',
    rating: 4.4,
    watchedDate: '2024-01-15',
    yourRating: 4,
    tags: ['Action', 'Nostalgia', 'Friendship'],
  },
];

const moodPreferences = [
  { mood: 'Cozy Vibes', selected: true },
  { mood: 'Adventure', selected: true },
  { mood: 'Heartbreak Healing', selected: false },
  { mood: 'Self-Discovery', selected: true },
  { mood: 'Family Bonding', selected: true },
  { mood: 'Late Night Contemplation', selected: false },
];

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Alex Chen',
    email: 'alex.chen@email.com',
    bio: 'Film enthusiast who loves discovering hidden gems and emotional stories. Always looking for movies that capture the complexity of human relationships.',
    location: 'San Francisco, CA',
    favoriteGenres: ['Drama', 'Sci-Fi', 'Romance'],
    joinDate: 'January 2024',
  });

  const [notifications, setNotifications] = useState({
    newRecommendations: true,
    weeklyDigest: true,
    friendActivity: false,
    newReleases: true,
  });

  const handleProfileUpdate = () => {
    setIsEditing(false);
    // Handle profile update logic
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-slate-950 to-pink-900/10"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fillRule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fillOpacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      <div className="relative">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to CineContext
              </Link>

              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <span className="text-xl font-bold">CineContext</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Picture & Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-slate-700">
                  <AvatarImage src="/placeholder.svg?height=128&width=128" alt={profileData.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                    {profileData.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-slate-800 border-2 border-slate-700 hover:bg-slate-700"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 text-center md:text-left">
                <h1 className="text-2xl font-bold text-white">{profileData.name}</h1>
                <p className="text-slate-400">{profileData.location}</p>
                <p className="text-sm text-slate-500 mt-1">Member since {profileData.joinDate}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-400">127</div>
                  <div className="text-xs text-slate-400">Watched</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-400">23</div>
                  <div className="text-xs text-slate-400">Watchlist</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">4.2</div>
                  <div className="text-xs text-slate-400">Avg Rating</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="watchlist" className="data-[state=active]:bg-purple-500">
                    Watchlist
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-purple-500">
                    History
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500">
                    Settings
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-white">About</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-slate-300">Bio</Label>
                            <Textarea
                              value={profileData.bio}
                              onChange={e =>
                                setProfileData({ ...profileData, bio: e.target.value })
                              }
                              className="bg-slate-700 border-slate-600 text-white"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300">Location</Label>
                            <Input
                              value={profileData.location}
                              onChange={e =>
                                setProfileData({ ...profileData, location: e.target.value })
                              }
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleProfileUpdate}
                              size="sm"
                              className="bg-purple-500 hover:bg-purple-600"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setIsEditing(false)}
                              variant="outline"
                              size="sm"
                              className="border-slate-600"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-slate-300">{profileData.bio}</p>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-2">
                              Favorite Genres
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {profileData.favoriteGenres.map(genre => (
                                <Badge
                                  key={genre}
                                  variant="secondary"
                                  className="bg-purple-500/20 text-purple-300"
                                >
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Mood Preferences */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Mood Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {moodPreferences.map(pref => (
                          <div
                            key={pref.mood}
                            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                              pref.selected
                                ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            <div className="text-sm font-medium">{pref.mood}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Watchlist Tab */}
                <TabsContent value="watchlist" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">My Watchlist</h3>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      {watchlistMovies.length} items
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    {watchlistMovies.map(movie => (
                      <Card key={movie.id} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <img
                              src={movie.image || '/placeholder.svg'}
                              alt={movie.title}
                              className="w-16 h-24 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-white">{movie.title}</h4>
                                  <p className="text-sm text-slate-400">{movie.year}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm text-slate-300">{movie.rating}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {movie.tags.map(tag => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-purple-500/20 text-purple-300 text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-slate-500">Added {movie.addedDate}</p>
                                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                                  <Play className="h-4 w-4 mr-1" />
                                  Watch
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Watch History</h3>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      {watchHistory.length} recent
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    {watchHistory.map(movie => (
                      <Card key={movie.id} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <img
                              src={movie.image || '/placeholder.svg'}
                              alt={movie.title}
                              className="w-16 h-24 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-white">{movie.title}</h4>
                                  <p className="text-sm text-slate-400">{movie.year}</p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-xs text-slate-400">Your rating:</span>
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < movie.yourRating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-slate-600'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm text-slate-300">{movie.rating}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {movie.tags.map(tag => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-purple-500/20 text-purple-300 text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-slate-500">
                                  Watched {movie.watchedDate}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Rewatch
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  {/* Account Settings */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Account Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-300">Name</Label>
                          <Input
                            value={profileData.name}
                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Email</Label>
                          <Input
                            value={profileData.email}
                            onChange={e =>
                              setProfileData({ ...profileData, email: e.target.value })
                            }
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <Button className="bg-purple-500 hover:bg-purple-600">Update Account</Button>
                    </CardContent>
                  </Card>

                  {/* Notification Settings */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <Label className="text-slate-300 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <p className="text-sm text-slate-500">
                              {key === 'newRecommendations' &&
                                'Get notified about new movie recommendations'}
                              {key === 'weeklyDigest' &&
                                'Receive weekly summary of trending content'}
                              {key === 'friendActivity' && 'See what your friends are watching'}
                              {key === 'newReleases' && 'Get alerts about new movie releases'}
                            </p>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={checked =>
                              setNotifications({ ...notifications, [key]: checked })
                            }
                            className="data-[state=checked]:bg-purple-500"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Privacy Settings */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Privacy & Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-300">Profile Visibility</Label>
                          <p className="text-sm text-slate-500">Control who can see your profile</p>
                        </div>
                        <Select defaultValue="friends">
                          <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="friends">Friends</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-300">Show Watch History</Label>
                          <p className="text-sm text-slate-500">
                            Let others see what you've watched
                          </p>
                        </div>
                        <Switch className="data-[state=checked]:bg-purple-500" />
                      </div>

                      <div className="pt-4 border-t border-slate-700">
                        <Button
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          Change Password
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Theme Settings */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-slate-300">Theme</Label>
                          <p className="text-sm text-slate-500">Choose your preferred theme</p>
                        </div>
                        <Select defaultValue="dark">
                          <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
