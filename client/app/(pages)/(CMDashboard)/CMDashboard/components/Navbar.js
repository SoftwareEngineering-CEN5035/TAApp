import React from 'react'

export default function Navbar() {
  return (
    <div className="flex flex-col gap-1">
    <div className={'grid grid-cols-5 gap-10 w-fit mx-auto'}>
        <p>TA Application</p>
        <Button text="Sign Up" />
        <Button text="Login In" dark/>
        <Button text="Login In" dark/>
        <Button />
    </div>
</div>
  )
}
