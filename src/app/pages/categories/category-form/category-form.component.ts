import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

import { switchMap } from 'rxjs/operators';

import toastr from "toastr";

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})

//Form to create/update a category
export class CategoryFormComponent implements OnInit {

  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMensages: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category;

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;

    if(this.currentAction = 'new'){
      this.createCategory();
    }else{//currentAction = edit
      this.updateCategory();
    }
  }

  //Private Methods

  private setCurrentAction() {//pegar a ação a ser realizada pelo formulário(editar ou criar um novo)
    if(this.route.snapshot.url[0].path == 'new')
      this.currentAction = 'new';
    else
      this.currentAction = 'edit'
  }

  private buildCategoryForm() {//criar o formulário
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(3)]],
      description: [null]
    })
  }

  private loadCategory() {//pegar a categoria a ser editada pelo id
    if(this.currentAction == 'edit'){

      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get('id')))
      )
      .subscribe(
        (category) =>{
          this.category = category;
          this.categoryForm.patchValue(category) // binds loaded category data to CategoryForm
        },
        (error) => alert('Ocorreu um erro no servidor, tente novamente mais tarde!')
      )
      
    }
  }

  private setPageTitle() {//editando o título do formulário
    if(this.currentAction == 'new') {
      this.pageTitle = 'Cadastro de Nova Categoria';
    }
    else {
      const categoryName = this.category.name || '';
      this.pageTitle = 'Editando Categoria: ' + categoryName;
    }
  }

  private createCategory(){//criando nova categoria
     const category: Category = Object.assign(new Category, this.categoryForm.value);

     this.categoryService.create(category)
     .subscribe(
       category => this.actionsForSucess(category),
       error => this.actionsForError(error)
     )
  }

  private updateCategory(){//editando categoria
    const category: Category = Object.assign(new Category, this.categoryForm.value);

    this.categoryService.update(category)
    .subscribe(
      category => this.actionsForSucess(category),
      error => this.actionsForError(error)
    )
  }

  private actionsForSucess(category: Category){
    toastr.success('Solicitação processada com sucesso!');

    this.router.navigateByUrl('categories', {skipLocationChange: true}).then(
      () => this.router.navigate(['categories',category.id,'edit'])
    )
  }

  private actionsForError(error){
    toastr.error('Ocorreu um erro ao processar sua solicitação');

    this.submittingForm = false;

    if(error.status === 422){
      this.serverErrorMensages = JSON.parse(error._body).errors;
    }else{
      this.serverErrorMensages = ['Falha na comunicação com o servidor.'];
    }
  }

}
