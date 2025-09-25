import React from "react";

const Newsletter = () => {
  return (
    <section className="relative mt-28">
      <div className="absolute top-8 left-1/2 container -translate-x-1/2 md:top-14">
        <div className="bg-primary-100 mx-auto max-w-[700px] rounded-lg px-8 py-9 text-center">
          <div className="mb-8">
            <h2 className="font-700 mb-4 text-2xl">¡Consigue tu gestor ya!</h2>
            <p>
              Solo toma un par de minutos registrarte y empezar gratis con tu
              propia gestion en proyectos de grado.
            </p>
          </div>
          <form>
            <div className="md:flex md:items-center md:justify-between md:gap-4">
              <div className="w-full relative">
                <input
                  className="mb-4 h-[45px] w-full rounded-full pl-4 text-black outline-none md:mb-0 bg-white"
                  type="email"
                  placeholder="email@ejemplo.com"
                />
                <p className="hidden text-accent-300 absolute bottom-4 left-4 md:bottom-[-1.3rem]">
                  Porfavor ingresa una direccion de correo electronico valida
                </p>
              </div>

              <button className="w-full from-accent-100 to-accent-200 font-700 relative overflow-hidden rounded-full bg-gradient-to-tr px-12 py-3 text-white after:absolute after:inset-0 after:rounded-full after:bg-white/0 after:transition-all after:duration-300 after:content-[''] hover:after:bg-white/30">
                Empieza ya y gratis
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
