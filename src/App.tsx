import { Search, User, Play, Star, Clock } from "lucide-react"
import { Button } from "./component/ui/button"
import { Card, CardContent } from "./component/ui/card"
import { Input } from "./component/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./component/ui/dropdown-menu"
import { Checkbox } from "./component/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./component/ui/select"
import { Badge } from "./component/ui/badge"
import { useEffect, useState, type ReactNode } from "react"
import { SignUpPage } from "./component/signup/signup"
import { BrowserRouter } from "react-router"
import { LoginPage } from "./component/login/login"
import { ForgotPasswordPage } from "./component/forgot-password/forgot-password"
import { ProfilePage } from "./component/profile/profile"
import Home from "./component/home/home"


export default function App() {

  return (
    <BrowserRouter><Home/>
  </BrowserRouter>)
}
