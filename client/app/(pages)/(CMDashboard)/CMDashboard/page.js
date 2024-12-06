import Hero from "./components/Hero";
import Main from "./components/Main";
import Button from "./components/Button";

export default function CMDashboard() {
  return (
      <Main className="bg-white">
            <div className="flex flex-col gap-1">
                <div className={'grid grid-cols-5 gap-10 w-fit mx-auto'}>
                    <p>TA Application</p>
                    <Button text="Home" />
                    <Button text="Courses" />
                    <Button text="Applications" />
                    <Button text="Logout" />
                </div>
            </div>
            <p className="p-4 y-4px text-3xl text-center textGradient">Home</p>
          <Hero />
      </Main>
  );
}