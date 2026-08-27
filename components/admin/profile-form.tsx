'use client'

import { useState, useTransition } from 'react'
import { Save, User, Globe, AlertCircle, Check, FileText, Upload, BookOpen, Heart, Sparkles } from 'lucide-react'
import { GithubIcon, LinkedinIcon, TwitterIcon, InstagramIcon } from '@/components/social-icons'
import type { Profile } from '@/lib/db/types'
import { updateProfileAction } from '@/app/admin/settings/actions'
import { uploadMediaAction } from '@/app/admin/media/actions'

interface ProfileFormProps {
  profile?: Profile | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [name, setName] = useState(profile?.name || '')
  const [email, setEmail] = useState(profile?.email || '')
  const [headline, setHeadline] = useState(profile?.headline || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url || '')
  const [education, setEducation] = useState(profile?.education || '')
  const [detailedBio, setDetailedBio] = useState(profile?.detailed_bio || '')
  const [engineeringInterests, setEngineeringInterests] = useState(profile?.engineering_interests || '')
  const [personalInterests, setPersonalInterests] = useState(profile?.personal_interests || '')
  const [website, setWebsite] = useState(profile?.website || '')
  const [github, setGithub] = useState(profile?.github || '')
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '')
  const [twitter, setTwitter] = useState(profile?.twitter || '')
  const [instagram, setInstagram] = useState(profile?.instagram || '')

  const [isPending, startTransition] = useTransition()
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt_text', `Profile picture of ${name || 'Ankit'}`)

    try {
      const res = await uploadMediaAction(formData)
      if (res.error) {
        setError(res.error)
      } else if (res.media) {
        setAvatarUrl(res.media.public_url)
        setSuccess('Profile picture uploaded! Save profile changes to activate.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile image')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingResume(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt_text', `Resume of ${name || 'Ankit'}`)

    try {
      const res = await uploadMediaAction(formData)
      if (res.error) {
        setError(res.error)
      } else if (res.media) {
        setResumeUrl(res.media.public_url)
        setSuccess('Resume file uploaded! Save profile changes to activate.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume file')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    formData.append('headline', headline)
    formData.append('bio', bio)
    formData.append('avatar_url', avatarUrl)
    formData.append('resume_url', resumeUrl)
    formData.append('education', education)
    formData.append('detailed_bio', detailedBio)
    formData.append('engineering_interests', engineeringInterests)
    formData.append('personal_interests', personalInterests)
    formData.append('website', website)
    formData.append('github', github)
    formData.append('linkedin', linkedin)
    formData.append('twitter', twitter)
    formData.append('instagram', instagram)

    startTransition(async () => {
      const res = await updateProfileAction(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess('Profile updated successfully! /me page and homepage refreshed.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl border border-green-500/40 bg-green-500/10 text-green-400 text-sm flex items-center gap-3">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Main Identity & Profile Picture */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-6">
        <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-3 flex items-center gap-2">
          <User size={16} className="text-primary" />
          Identity & Profile Image
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs font-mono text-muted-foreground">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ankit"
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-mono text-muted-foreground">
              Public / Contact Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ankit@example.com"
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="headline" className="block text-xs font-mono text-muted-foreground">
            Headline / Primary Focus Title
          </label>
          <input
            id="headline"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Third-year BTech Student | Software Engineer"
            className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="education" className="block text-xs font-mono text-muted-foreground">
            Current Education / Status
          </label>
          <input
            id="education"
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="Third-year BTech student in Computer Science"
            className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        {/* Profile Picture Upload & Preview */}
        <div className="p-4 rounded-xl border border-border/60 bg-secondary/20 space-y-4">
          <label htmlFor="avatar_url" className="block text-xs font-mono font-semibold text-foreground flex items-center gap-2">
            <Upload size={15} className="text-accent" />
            Profile Picture Management
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {avatarUrl ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border/80 bg-background flex-shrink-0">
                <img src={avatarUrl} alt={name || 'Profile'} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl border border-dashed border-border/60 bg-background flex items-center justify-center flex-shrink-0 text-muted-foreground text-xs font-mono">
                No Image
              </div>
            )}

            <div className="space-y-2 flex-1 w-full">
              <input
                id="avatar_url"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://... or upload photo below"
                className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground focus:outline-none focus:border-accent"
              />
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-secondary text-foreground text-xs font-mono cursor-pointer whitespace-nowrap">
                <Upload size={14} />
                {uploadingAvatar ? 'Uploading Photo...' : 'Upload Profile Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="p-4 rounded-xl border border-border/60 bg-secondary/20 space-y-3">
          <label htmlFor="resume_url" className="block text-xs font-mono font-semibold text-foreground flex items-center gap-2">
            <FileText size={15} className="text-accent" />
            Resume Management
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              id="resume_url"
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://... or upload PDF below"
              className="flex-1 px-3 py-2 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground w-full"
            />
            <label className="px-4 py-2 rounded-xl border border-border/60 bg-card hover:bg-secondary text-foreground text-xs font-mono cursor-pointer whitespace-nowrap">
              {uploadingResume ? 'Uploading PDF...' : 'Upload PDF Resume'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeFileUpload}
                disabled={uploadingResume}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* About & Interests */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-6">
        <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-3 flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          About &amp; Personal Dossier
        </h2>

        <div className="space-y-2">
          <label htmlFor="bio" className="block text-xs font-mono text-muted-foreground">
            Short Bio / Summary
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short developer bio..."
            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground focus:outline-none focus:border-accent leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="detailed_bio" className="block text-xs font-mono text-muted-foreground">
            Detailed Personal Background / Story
          </label>
          <textarea
            id="detailed_bio"
            rows={5}
            value={detailedBio}
            onChange={(e) => setDetailedBio(e.target.value)}
            placeholder="Write your personal story, goals, and learning philosophy..."
            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground focus:outline-none focus:border-accent leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="engineering_interests" className="block text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={14} className="text-accent" /> Engineering &amp; CS Interests
            </label>
            <textarea
              id="engineering_interests"
              rows={4}
              value={engineeringInterests}
              onChange={(e) => setEngineeringInterests(e.target.value)}
              placeholder="AI/ML Systems, Full-Stack Applications, Computer Science Fundamentals, Software Architecture, Learning by Building, Technical Writing"
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground focus:outline-none focus:border-accent leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="personal_interests" className="block text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <Heart size={14} className="text-pink-500" /> Personal Interests &amp; Passions
            </label>
            <textarea
              id="personal_interests"
              rows={4}
              value={personalInterests}
              onChange={(e) => setPersonalInterests(e.target.value)}
              placeholder="Poetry, Football, Philosophy, Exploring ideas beyond software engineering"
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground focus:outline-none focus:border-accent leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-6">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-3">
          Social Links &amp; Presence
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="github" className="block text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <GithubIcon size={14} /> GitHub Username / URL
            </label>
            <input
              id="github"
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="ankit or https://github.com/ankit"
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="linkedin" className="block text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <LinkedinIcon size={14} /> LinkedIn Username / URL
            </label>
            <input
              id="linkedin"
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="ankit or https://linkedin.com/in/ankit"
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="twitter" className="block text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <TwitterIcon size={14} /> Twitter / X Handle
            </label>
            <input
              id="twitter"
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@ankit"
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="instagram" className="block text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <InstagramIcon size={14} /> Instagram Username / URL
            </label>
            <input
              id="instagram"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="ankit"
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="block text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <Globe size={14} /> Personal Website
            </label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://ankit.dev"
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-background text-xs font-mono text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Save Action */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || uploadingAvatar || uploadingResume}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Save size={16} />
          {isPending ? 'Saving Profile...' : 'Save Profile Changes'}
        </button>
      </div>
    </form>
  )
}
